const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('./errorTacker');
const xml2jsObj = require('xml-js');
const moment = require('moment');
const _ = require('lodash');
const db = require('../models');
var Op = require('sequelize').Op;
var { getMonthsBeforeGivenDate, getWeeksStartAndEndInMonth, checkIfDateIsBetweenTwoDates } = require('../utils/utils');

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

    console.log('Creating new client token...')

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

    var oldTpDate = parseInt(localStorage.getItem('TPDate') || 0)
    var oldTpToken = localStorage.getItem('TPToken')

    if ((Date.now() - oldTpDate) / 1000 < 3600 && oldTpToken) {
      return oldTpToken
    }

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
          localStorage.setItem('TPDate', Date.now())
          localStorage.setItem('TPToken', access_token)
          return access_token
        }
        return null
      })
      .catch(error => {
        console.log('Third Party Token creating error =', error)
        return null
      })
  } catch (error) {
    console.log('Third Party Token Creating Error ', error)
    return null
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

const retailCustomerDetails = async (refreshToken, subscriptionId) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

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
      let retailCustomer = result.feed.entry.content["cust:retailCustomer"]

      if (retailCustomer) {
        let meterAccountNumber = retailCustomer['cust:accountNumber']._text
        let mainAddress = retailCustomer['cust:mainAddress']
        let address = mainAddress['cust:streetDetail']._text + ' ' + mainAddress['cust:cityDetail']._text + ', ' + mainAddress['cust:stateDetail']._text + ' ' + mainAddress['cust:postalCode']._text

        console.log("meterAccountNumber >> ", meterAccountNumber, "Address >> ", address);
        result = {
          meterAccountNumber,
          address
        }
        console.log("Customer Details DATA >> ", result)
        return result;
      } else {
        console.log('Retail Customer Data =', retailCustomer)
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
      let links = result.feed.entry.link
      if (links.length > 0) {
        let usagePointId
        for (let i = 0; i < links.length; i++) {
          const element = links[i];
          if (element._attributes.rel === 'self') {
            usagePointId = element._attributes.href.split("/").pop();
            break
          }
        }
        console.log("usagePointDetails >> ", usagePointId)
        return usagePointId;
      } else {
        console.log("usagePointDetails null >> ", links)
        return null
      }
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
        return meterReadingId;
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

const intervalBlock = async (SlackHook, headers, data) => {
  let { subscriptionId, usagePointId, meterReadingId, startDate, endDate, tokenId } = data
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

    createLogItem(SlackHook, true, 'intervalBlock Function', "XMl data", JSON.stringify(data))


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
      let links = resultArrayElement.link
      for (let a = 0; a < links.length; a++) {
        const linkElement = links[a];
        if (linkElement._attributes.href.includes('KVARH')) {
          KVARH = true
        } else {
          KVARH = false
        }
      }
      let intervalBlocks = resultArrayElement.content['espi:intervalBlocks']['espi:intervalBlock']

      if (intervalBlocks.length > 0) {

        for (let a = 0; a < intervalBlocks.length; a++) {
          const intervalBlockElement = intervalBlocks[a];

          let timestamp = intervalBlockElement['espi:interval']['espi:start']._text

          let intervalReading = intervalBlockElement['espi:intervalReading']
          intervalReading = intervalReading.map(e => Number(e['espi:value']._text));

          let intervalReadingTotal = _.sum(intervalReading);
          console.log(intervalReadingTotal);
          let date = moment.unix(timestamp).format('YYYY-MM-DD');
          if (KVARH) {
            dateViseIntervalBlock[date] = {
              date: date,
              KVARHReading: intervalReadingTotal,
              tokenId: tokenId,
              KWHReading: null
            }
          } else {
            dateViseIntervalBlock[date].KWHReading = intervalReadingTotal
          }
        }
      }
    }
    console.log("dateViseIntervalBlock >> ", dateViseIntervalBlock)

    createLogItem(SlackHook, true, 'dateViseIntervalBlock', "dateViseIntervalBlock data", JSON.stringify(dateViseIntervalBlock))

    let array = []
    for (const property in dateViseIntervalBlock) {
      array.push(dateViseIntervalBlock[property]);
    }

    createLogItem(SlackHook, true, 'array', "array data", JSON.stringify(array, null, 2))
    console.log("array >>", array);

    return array
  }
  catch (error) {
    console.log('intervalBlock error =', error)
    throw error
  }
}

const intervalBlockTest = async (refreshToken, subscriptionId, usagePointId, meterReadingId, tokenId, res) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    },
      firstDayOfYear = moment().startOf('year').format('YYYY-MM-DD');

    let meterReading = await db.MeterReading.findAll({
      where: {
        tokenId: tokenId,
        date: { [Op.gt]: firstDayOfYear }
      }
    })

    let readingDate = moment().format('YYYY-MM-DD');

    if (meterReading.length > 0) {
      let obj = {
        subscriptionId: subscriptionId,
        usagePointId: usagePointId,
        meterReadingId: meterReadingId,
        startDate: readingDate,
        endDate: readingDate,
        tokenId: tokenId
      }
      let array = await intervalBlock(headers, obj)
      return array
    } else {

      let d = new Date(),
        year = moment().year()

      let months = getMonthsBeforeGivenDate(d);
      let weeksDates = []
      for (let i = 0; i < months.length; i++) {
        const element = months[i];
        let array = getWeeksStartAndEndInMonth(element, year, "monday");
        weeksDates = weeksDates.concat(array)
      }
      console.log('weeksDates >> ', weeksDates)
      let MeterReadingTillDate = [],
        lastWeek = false
      for (let i = 0; i < weeksDates.length; i++) {
        let weeksDatesElement = weeksDates[i];
        if (checkIfDateIsBetweenTwoDates(moment(d).format('YYYY-MM-DD'), weeksDatesElement)) {
          weeksDatesElement = { startDate: weeksDatesElement.startDate, endDate: moment(d).format('YYYY-MM-DD') }
          lastWeek = true
        }
        let obj = {
          subscriptionId: subscriptionId,
          usagePointId: usagePointId,
          meterReadingId: meterReadingId,
          startDate: weeksDatesElement.startDate,
          endDate: weeksDatesElement.endDate,
          tokenId: tokenId
        }
        let array = await intervalBlock(headers, obj)
        MeterReadingTillDate.concat(array)
        if (lastWeek) {
          break
        }
      }
      console.log(MeterReadingTillDate)

      return MeterReadingTillDate
    }
  } catch (error) {
    console.log('intervalBlock Error ', error)
    return new Error(error)
  }
}

module.exports = {
  generateThirdPartyToken,
  apiClient,
  retailCustomerDetails,
  usagePointDetails,
  meterReading,
  intervalBlockTest,
  intervalBlock
}