const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('./errorTacker');
const xml2jsObj = require('xml-js');
const moment = require('moment');
const momentTZ = require('moment-timezone');
const _ = require('lodash');
const db = require('../models');
var Op = require('sequelize').Op;
var { getMonthsBeforeGivenDate, getWeeksStartAndEndInMonth, checkIfDateIsBetweenTwoDates, splitArrayIntoChunksOfLen, weekDatesArrayTillToday, comparerArray, subtractDay } = require('../utils/utils');

var LocalStorage = require('node-localstorage').LocalStorage,
  localStorage = new LocalStorage('./scratch')

require('dotenv').config()

const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const headers = {
  'content-type': 'application/json',
  'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY
}

const agent = new https.Agent({
  rejectUnauthorized: false
})

let instance = axios.create({
  baseURL: 'https://api.coned.com/gbc/v1/',
  timeout: 100000,
  headers,
  httpsAgent: agent,
  maxContentLength: 100000000,
  maxBodyLength: 100000000
})

const generateClientToken = async function () {
  try {
    var oldDate = parseInt(localStorage.getItem('date') || 0)
    var oldToken = localStorage.getItem('token')

    if ((Date.now() - oldDate) / 1000 < 3600 && oldToken) {
      return oldToken
    }

    // console.log('Creating new client token...')

    const data = {
      grantType: 'client_credentials',
      clientId: APPSETTING_CLIENT_ID,
      clientSecret: APPSETTING_CLIENT_SECRET,
      Scope: 'FB=3_35_47'
    }

    return await instance
      .post('oauth/v1/Token', data)
      .then(async ({ data }) => {
        const { access_token } = data || {}

        if (access_token) {
          console.log('Created new client token successfully')
          localStorage.setItem('date', Date.now())
          localStorage.setItem('token', access_token)
          return access_token
        }
        return null
      })
      .catch(error => {
        console.log('Token creating error =', error)
        return null
      })
  } catch (error) {
    console.log('Token Creating Error ', error)
    return null
  }
}

const apiClient = async () => {
  try {
    let AUTH_TOKEN = await generateClientToken()
    if (AUTH_TOKEN) {
      createLogItem(true, 'Client Token', AUTH_TOKEN)
      instance.defaults.headers.common['Authorization'] = 'Bearer ' + AUTH_TOKEN
    }
    return instance
  } catch (error) { }
}

const generateThirdPartyToken = async function (refreshToken, subscriptionId) {
  try {

    var oldTpData = parseInt(localStorage.getItem(`${subscriptionId}`))

    if ((Date.now() - oldTpData.TPDate) / 1000 < 3600 && oldTpData.TPToken) {
      return oldTpData.TPToken
    }

    console.log(`
     APPSETTING_CLIENT_ID >> = ${APPSETTING_CLIENT_ID},
     APPSETTING_CLIENT_SECRET >> = ${APPSETTING_CLIENT_SECRET},
     refreshToken >> = ${refreshToken},
     subscriptionId >> = ${subscriptionId}
 
 
     `);

    const data = {
      grantType: "refresh_token",
      clientId: APPSETTING_CLIENT_ID,
      clientSecret: APPSETTING_CLIENT_SECRET,
      refreshToken: refreshToken,
      subscriptionId: subscriptionId
    }

    return await axios.create({
      baseURL: 'https://api.coned.com/gbc/v1/',
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    })
      .post('oauth/v1/Token', data)
      .then(async ({ data }) => {
        const { access_token } = data || {}

        if (access_token) {
          console.log('Created new Third Party token successfully')
          let tokenObj = {
            'TPDate': Date.now(),
            'TPToken': access_token
          }
          localStorage.setItem(`${subscriptionId}`, JSON.stringify(tokenObj))
          return access_token
        }
        return null
      })
      .catch(error => {
        throw error
      })
  } catch (error) {
    throw error
  }
}

const ThirdPartyApiClient = async (refreshToken, subscriptionId) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)
    if (AUTH_TOKEN) {
      createLogItem(true, 'Client TP Token', AUTH_TOKEN)
      instance.defaults.headers.common['Authorization'] = 'Bearer ' + AUTH_TOKEN
    }
    return instance
  } catch (error) { }
}

const retailCustomerDetails = async (refreshToken, subscriptionId, userId, conedSub) => {
  console.log(`refreshToken >> = ${refreshToken}, 
                subscriptionId >>= ${subscriptionId},
                userId >>= ${userId},
                conedSub >>= ${conedSub}`);
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    console.log(`AUTH_TOKEN >> = ${AUTH_TOKEN}`);

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    }

    return await axios({
      method: 'get',
      url: `https://api.coned.com/gbc/v1/resource/Customer/${subscriptionId}`,
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }).then(async ({ data }) => {
      let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });

      let resultArray = []
      if (!result.feed.entry.length) {
        resultArray.push(result.feed.entry);
      } else {
        resultArray = result.feed.entry
      }
      let addressArray = []
      for (let i = 0; i < resultArray.length; i++) {
        const element = resultArray[i];
        let retailCustomer = element.content["cust:retailCustomer"]

        if (retailCustomer) {
          let meterAccountNumber = retailCustomer['cust:accountNumber']._text
          let mainAddress = retailCustomer['cust:mainAddress']
          let address = mainAddress['cust:streetDetail']._text + ' ' + mainAddress['cust:cityDetail']._text + ', ' + mainAddress['cust:stateDetail']._text + ' ' + mainAddress['cust:postalCode']._text

          console.log("meterAccountNumber >> ", meterAccountNumber, "Address >> ", address);
          let obj = { userId, meterAccountId: meterAccountNumber, conedAddress: address, conedSub: conedSub }
          console.log("Customer Details DATA >> ", result)
          addressArray.push(obj);
        }
      }

      addressArray = addressArray.filter((value, index, self) =>
        index === self.findIndex((t) => (
          t.meterAccountNumber === value.meterAccountNumber && t.address === value.address
        ))
      )

      if (addressArray.length > 0) {
        console.log("Customer Details DATA >> ", addressArray)
        return addressArray;
      } else {
        console.log('Retail Customer Data =', addressArray)
        return null
      }
    })
      .catch(error => {
        console.log('Retail Customer Data error =', error)
        return null
      })
  } catch (error) {
    console.log('Retail Customer Data error ', error)
    return null
  }
}

const usagePointDetails = async (refreshToken, subscriptionId) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    }

    return await axios({
      method: 'get',
      url: `https://api.coned.com/gbc/v1/resource/Subscription/${subscriptionId}/UsagePoint`,
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }).then(async ({ data }) => {
      let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });

      let resultArray = []
      if (!result.feed.entry.length) {
        resultArray.push(result.feed.entry)
      } else {
        resultArray = result.feed.entry
      }

      let usagePoints = []
      for (let a = 0; a < resultArray.length; a++) {
        const links = resultArray[a].link;
        if (links.length > 0) {
          let usagePointId

          for (let i = 0; i < links.length; i++) {
            const element = links[i];
            if (element._attributes.rel === 'self') {
              usagePointId = element._attributes.href.split("/").pop();
            }
          }

          console.log("usagePointDetails >> ", usagePointId)
          usagePoints.push(usagePointId);
        }
      }

      return usagePoints
    })
      .catch(error => {
        console.log('usagePointDetails error =', error)
        return null
      })
  } catch (error) {
    console.log('usagePointDetails Error ', error)
    return null
  }
}

const meterReading = async (refreshToken, subscriptionId, usagePointId) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    }

    return await axios({
      method: 'get',
      url: `https://api.coned.com/gbc/v1/resource/Subscription/${subscriptionId}/UsagePoint/${usagePointId}/MeterReading`,
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }).then(async ({ data }) => {
      let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });
      let links = result.feed.entry.link
      if (links.length > 0) {
        let meterReadingId
        for (let i = 0; i < links.length; i++) {
          const element = links[i];
          if (element._attributes.rel === 'self') {
            meterReadingId = element._attributes.href.split("/").pop();
            break
          }
        }
        console.log("MeterReading >> ", meterReadingId)
        return { meterReadingId, usagePointId };
      } else {
        console.log("MeterReading null >> ", links)
        return null
      }
    })
      .catch(error => {
        console.log('MeterReading error =', error)
        return null
      })
  } catch (error) {
    console.log('MeterReading Error ', error)
    return null
  }
}

const intervalBlock = async (headers, data) => {
  let { subscriptionId, usagePointId, meterReadingId, startDate, endDate, intervalBlockPayloadId } = data
  try {
    let options = {
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }
    let { data } = await axios.get(`https://api.coned.com/gbc/v1/resource/Subscription/${subscriptionId}/UsagePoint/${usagePointId}/MeterReading/${meterReadingId}/IntervalBlock?publishedMin=${startDate}&publishedMax=${endDate}`, options)
    let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });
    console.log("RESULT ==>", result);

    let KVARH = false
    let dateViseIntervalBlock = {}
    let resultArray = []
    console.log('result.feed.entry >> ', result.feed.entry);
    if (!result.feed.entry.length) {
      resultArray.push(result.feed.entry);
    } else {
      resultArray = result.feed.entry
    }
    for (let j = 0; j < resultArray.length; j++) {
      const resultArrayElement = resultArray[j];
      // console.log("Result Array Element timePeriod=", JSON.stringify(resultArrayElement.content['espi:intervalBlocks']['espi:intervalBlock']['espi:timePeriod'], 2, null));
      // console.log("Result Array Element value=", JSON.stringify(resultArrayElement.content['espi:intervalBlocks']['espi:intervalBlock']['espi:value'], 2, null));
      let links = resultArrayElement.link
      for (let a = 0; a < links.length; a++) {
        const linkElement = links[a];
        if (linkElement._attributes.href.includes('KVARH')) {
          KVARH = true
        } else {
          KVARH = false
        }
      }

      let intervalBlocksArray = []
      let intervalBlocks = resultArrayElement.content['espi:intervalBlocks']['espi:intervalBlock']
      if (!Array.isArray(intervalBlocks)) {
        intervalBlocksArray.push(intervalBlocks)
      } else {
        intervalBlocksArray = intervalBlocks
      }

      if (intervalBlocksArray.length > 0) {

        for (let a = 0; a < intervalBlocksArray.length; a++) {
          const intervalBlockElement = intervalBlocksArray[a];

          let timestamp = intervalBlockElement['espi:interval']['espi:start']._text

          let intervalReading = intervalBlockElement['espi:intervalReading']
          // console.log("<< intervalReading >>", JSON.stringify(intervalReading, 2, null));
          intervalReading = intervalReading.map(e => Number(e['espi:value']._text));

          console.log(">> intervalReading <<", intervalReading);


          let intervalReadingTotal = _.sum(intervalReading);

          // let intervalReadingTotal = 0;
          // for (let i = 0; i < intervalReading.length; i++) {
          //   intervalReadingTotal += intervalReading[i];
          // }

          console.log("<< sum >>", intervalReadingTotal);

          // console.log(intervalReadingTotal);
          let date = moment.unix(timestamp).format('YYYY-MM-DD');
          if (KVARH) {
            console.log("<< dateViseIntervalBlock[date] KVARH>>", dateViseIntervalBlock[date]);
            console.log("<< dateViseIntervalBlock[date].KWHReading KVARH>>", dateViseIntervalBlock[date].KWHReading);

            dateViseIntervalBlock[date] = {
              date: date,
              KVARHReading: intervalReadingTotal,
              intervalBlockPayloadId: intervalBlockPayloadId,
              KWHReading: null
            }
          } else {
            console.log("<< dateViseIntervalBlock[date] >>", dateViseIntervalBlock[date]);
            console.log("<< dateViseIntervalBlock[date].KWHReading >>", dateViseIntervalBlock[date].KWHReading);

            dateViseIntervalBlock[date].KWHReading = intervalReadingTotal
          }
        }
      }
    }
    console.log("dateViseIntervalBlock >> ", dateViseIntervalBlock)

    let array = []
    for (const property in dateViseIntervalBlock) {
      array.push(dateViseIntervalBlock[property]);
    }
    console.log("array >>", array);

    return array
  }
  catch (error) {
    console.log('intervalBlock error =', error)
    throw { error, payload: data }
  }
}


const intervalBlockHourly = async (headers, data) => {
  let { subscriptionId, usagePointId, meterReadingId, startDate, endDate, intervalBlockPayloadId } = data
  try {
    let options = {
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }
    let { data } = await axios.get(`https://api.coned.com/gbc/v1/resource/Subscription/${subscriptionId}/UsagePoint/${usagePointId}/MeterReading/${meterReadingId}/IntervalBlock?publishedMin=${startDate}&publishedMax=${endDate}`, options)
    let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });

    let KVARH = false
    let dateViseIntervalBlock = {}
    let resultArray = []
    if (!result.feed.entry.length) {
      resultArray.push(result.feed.entry);
    } else {
      resultArray = result.feed.entry
    }
    for (let j = 0; j < resultArray.length; j++) {
      const element = resultArray[j];
      let links = element.link
      for (let a = 0; a < links.length; a++) {
        const linkElement = links[a];
        if (linkElement._attributes.href.includes('KVARH')) {
          KVARH = true
        } else {
          KVARH = false
        }
      }
      let intervalBlocksArray = []
      let intervalBlocks = element.content['espi:intervalBlocks']['espi:intervalBlock']
      if (!Array.isArray(intervalBlocks)) {
        intervalBlocksArray.push(intervalBlocks)
      } else {
        intervalBlocksArray = intervalBlocks
      }

      if (intervalBlocksArray.length > 0) {

        for (let i = 0; i < intervalBlocksArray.length; i++) {

          const intervalBlockElement = intervalBlocksArray[i];

          let timestamp = intervalBlockElement['espi:interval']['espi:start']._text
          let date = moment.unix(timestamp).format('YYYY-MM-DD');

          let intervalReading = intervalBlockElement['espi:intervalReading']

          let arrayData = splitArrayIntoChunksOfLen(intervalReading, 12)
          console.log(Object.keys(arrayData).length);
          for (let a = 0; a < arrayData.length; a++) {
            let element = arrayData[a];

            let time = element[0]['espi:timePeriod']['espi:start']._text
            time = moment.unix(time).tz("America/New_York").format("HH");
            element = element.map(e => Number(e['espi:value']._text));
            let intervalReadingTotal = _.sum(element);
            // datas.push(element)
            // console.log("<< element >>", element);
            console.log("date ", date, "HH :- ", time, " ", intervalReadingTotal);
            if (KVARH) {
              let key = date + ":" + time
              dateViseIntervalBlock[key] = {
                date: date,
                time: time,
                intervalBlockPayloadId,
                KVARHReading: intervalReadingTotal,
                KWHReading: null
              }
            } else {
              let key = date + ":" + time
              dateViseIntervalBlock[key].KWHReading = intervalReadingTotal
            }
          }
        }
      }
    }
    let array = []
    for (const property in dateViseIntervalBlock) {
      array.push(dateViseIntervalBlock[property]);
    }

    return array
  }
  catch (error) {
    console.log('intervalBlock error =', error)
    throw { error, payload: data }
  }
}

const intervalBlockTest = async (refreshToken, subscriptionId, GCEP_IntervalBlockPayloads) => {
  try {
    let readingEndDate = moment().format('YYYY-MM-DD'),
      d = new Date(),
      year = moment().year(),
      lastYear = moment().subtract(1, "years").format('YYYY')
    let yearArray = [lastYear, year]
    let responseArray = []
    for (let index = 0; index < GCEP_IntervalBlockPayloads.length; index++) {

      let intervalBlockElement = GCEP_IntervalBlockPayloads[index]
      let meterReadingId = intervalBlockElement.meterReadingId;
      let usagePointId = intervalBlockElement.usagePointId;
      let intervalBlockPayloadId = intervalBlockElement.id;

      let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

      let headers = {
        'content-type': 'application/json',
        'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
        'Authorization': 'Bearer ' + AUTH_TOKEN
      },
        firstDayOfYear = moment().startOf('year').format('YYYY-MM-DD');

      let meterReading = await db.MeterReading.findAll({
        where: {
          intervalBlockPayloadId: intervalBlockPayloadId,
          date: { [Op.gt]: firstDayOfYear }
        }
      })

      if (meterReading.length > 0) {

        let readingStartDate = subtractDay(readingEndDate)

        let obj = {
          subscriptionId: subscriptionId,
          usagePointId: usagePointId,
          meterReadingId: meterReadingId,
          startDate: readingStartDate,
          endDate: readingEndDate,
          intervalBlockPayloadId: intervalBlockPayloadId
        }

        let todayReading = meterReading.filter(e => e.date === readingEndDate)
        let yesterdayReading = meterReading.filter(e => e.date === readingStartDate)

        let intervalBlockData = await intervalBlock(headers, obj)
        if (todayReading && todayReading.length === 0 || yesterdayReading && yesterdayReading.length === 0) {
          let intervalBlockToday
          if (yesterdayReading.length > 0) {
            intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate)
          } else {
            intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate || e.date == readingStartDate)
          }
          if (intervalBlockToday.length > 0) {
            // let data = await db.MeterReading.bulkCreate(intervalBlockToday);
            createLogItem(true, 'intervalBlockTest', "intervalBlockTest Added Success", JSON.stringify(intervalBlockToday))
            return intervalBlockToday
          }
        }
      } else {
        let weeksDates = weekDatesArrayTillToday(d, yearArray),
          MeterReadingTillDate = []

        for (let i = 0; i < weeksDates.length; i++) {
          let weeksDatesElement = weeksDates[i];

          let obj = {
            subscriptionId: subscriptionId,
            usagePointId: usagePointId,
            meterReadingId: meterReadingId,
            startDate: weeksDatesElement.startDate,
            endDate: weeksDatesElement.endDate,
            intervalBlockPayloadId: intervalBlockPayloadId
          }

          let array = await intervalBlock(headers, obj)
          array = comparerArray(MeterReadingTillDate, array)     // compare and return unique object from second array 

          MeterReadingTillDate = MeterReadingTillDate.concat(array)
        }
        console.log(MeterReadingTillDate)
        createLogItem(true, 'intervalBlockTest MeterReadingTillDate', "intervalBlockTest MeterReadingTillDate", JSON.stringify(MeterReadingTillDate))
        responseArray = responseArray.concat(MeterReadingTillDate)
      }
    }
    return responseArray
  } catch (error) {
    console.log('intervalBlock Error ', error)
    return new Error(error)
  }
}
const intervalBlockHourlyTest = async (refreshToken, subscriptionId, usagePointId, meterReadingId, tokenId) => {
  let readingEndDate = moment().format('YYYY-MM-DD'),
    d = new Date(),
    year = moment().year()


  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    },
      firstDayOfYear = moment().startOf('year').format('YYYY-MM-DD');

    let meterReading = await db.MeterReadingHourly.findAll({
      where: {
        tokenId: tokenId,
        date: { [Op.gt]: firstDayOfYear }
      }
    })

    if (meterReading.length > 0) {

      let readingStartDate = subtractDay(readingEndDate)

      let obj = {
        subscriptionId: subscriptionId,
        usagePointId: usagePointId,
        meterReadingId: meterReadingId,
        startDate: readingStartDate,
        endDate: readingEndDate,
        tokenId: tokenId
      }

      let todayReading = meterReading.filter(e => e.date === readingEndDate)
      let yesterdayReading = meterReading.filter(e => e.date === readingStartDate)

      let intervalBlockData = await intervalBlockHourly(headers, obj)
      if (todayReading && todayReading.length === 0 || yesterdayReading && yesterdayReading.length === 0) {
        let intervalBlockToday
        if (yesterdayReading.length > 0) {
          intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate)
        } else {
          intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate || e.date == readingStartDate)
        }
        if (intervalBlockToday.length > 0) {
          let data = await db.MeterReadingHourly.bulkCreate(intervalBlockToday);
          createLogItem(true, 'intervalBlockToday', "intervalBlockToday Added", JSON.stringify(data))
          return data
        }
      }
    } else {
      let weeksDates = weekDatesArrayTillToday(d, year),
        MeterReadingTillDate = []

      for (let i = 0; i < weeksDates.length; i++) {
        let weeksDatesElement = weeksDates[i];

        let obj = {
          subscriptionId: subscriptionId,
          usagePointId: usagePointId,
          meterReadingId: meterReadingId,
          startDate: weeksDatesElement.startDate,
          endDate: weeksDatesElement.endDate,
          tokenId: tokenId
        }

        let array = await intervalBlockHourly(headers, obj)
        array = comparerArray(MeterReadingTillDate, array)     // compare and return unique object from second array 

        MeterReadingTillDate = MeterReadingTillDate.concat(array)
      }
      console.log(MeterReadingTillDate)
      let MeterReadingTillDateChunks = splitArrayIntoChunksOfLen(MeterReadingTillDate, 1000)
      createLogItem(true, 'MeterReadingTillDate', "MeterReadingTillDate", JSON.stringify(MeterReadingTillDate))
      let data = []
      for (let index = 0; index < MeterReadingTillDateChunks.length; index++) {
        const element = MeterReadingTillDateChunks[index];
        let d = await db.MeterReadingHourly.bulkCreate(element);
        data.push(d)
      }

      console.log("MeterReadingHourly BulkCreate >>> ", data)
      return data
    }

  } catch (error) {
    createLogItem(true, 'meterReadingHourly CRON ERROR', "error in meterReadingHourly cron", JSON.stringify(error))
    console.log('meterReadingHourly Cron Error ', error)
    if (error.payload) {
      let payload = {
        errorMessage: error?.error?.message, tokenId: error.payload.tokenId, minDate: error.payload.startDate, maxDate: error.payload.endDate
      }
      await db.MeterCronError.create(payload)
    }
    throw error
  }
}

module.exports = {
  generateThirdPartyToken,
  apiClient,
  retailCustomerDetails,
  usagePointDetails,
  meterReading,
  intervalBlockTest,
  intervalBlock,
  intervalBlockHourly,
  intervalBlockHourlyTest
}