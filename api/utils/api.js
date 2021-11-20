const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('./errorTacker');
const xml2jsObj = require('xml-js');


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

exports.apiClient = async () => {
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

exports.ThirdPartyApiClient = async (refreshToken, subscriptionId) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)
    if (AUTH_TOKEN) {
      createLogItem(true, 'Client TP Token', AUTH_TOKEN)
      instance.defaults.headers.common['Authorization'] = 'Bearer ' + AUTH_TOKEN
    }
    return instance
  } catch (error) { }
}

exports.retailCustomerDetails = async (refreshToken, subscriptionId) => {
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

exports.usagePointDetails = async (refreshToken, subscriptionId) => {
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
        let MeterReadingUrl
        for (let i = 0; i < links.length; i++) {
          const element = links[i];
          if (element._attributes.href.includes('MeterReading')) {
            MeterReadingUrl = element._attributes.href
            break
          }
        }
        console.log("usagePointDetails >> ", MeterReadingUrl)
        return MeterReadingUrl;
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

exports.meterReading = async (refreshToken, subscriptionId, usagePointId) => {
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
        let IntervalBlockUrl
        for (let i = 0; i < links.length; i++) {
          const element = links[i];
          if (element._attributes.href.includes('IntervalBlock')) {
            IntervalBlockUrl = element._attributes.href
            break
          }
        }
        console.log("MeterReading >> ", IntervalBlockUrl)
        return IntervalBlockUrl;
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

exports.intervalBlock = async (refreshToken, subscriptionId, usagePointId, meterReadingId, publishedMin, publishedMax) => {
  try {
    let AUTH_TOKEN = await generateThirdPartyToken(refreshToken, subscriptionId)

    let headers = {
      'content-type': 'application/json',
      'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
      'Authorization': 'Bearer ' + AUTH_TOKEN
    }

    return await axios({
      method: 'get',
      url: `https://api.coned.com/gbc/v1/resource/Subscription/${subscriptionId}/UsagePoint/${usagePointId}/MeterReading/${meterReadingId}/IntervalBlock?publishedMin=${publishedMin}&publishedMax=${publishedMax}`,
      timeout: 100000,
      headers,
      httpsAgent: agent,
      maxContentLength: 100000000,
      maxBodyLength: 100000000
    }).then(async ({ data }) => {
      let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });

      let intervalBlocks = result.feed.entry.content['espi:intervalBlocks']['espi:intervalBlock']

      if (intervalBlocks.length > 0) {
        let dateViseIntervalBlock = []
        for (let i = 0; i < intervalBlocks.length; i++) {
          const element = intervalBlocks[i];

          let timestamp = element['espi:interval']['espi:start']._text
          let obj = {}
          obj.date = moment.unix(timestamp).format('YYYY-MM-DD');

          let intervalReading = element['espi:intervalReading']
          intervalReading = intervalReading.map(e => Number(e['espi:value']._text));

          let intervalReadingTotal = _.sum(intervalReading);
          console.log(intervalReadingTotal);
          obj.totalUsage = intervalReadingTotal
          dateViseIntervalBlock.push(obj)

        }
        console.log("intervalBlock >> ", result)
        return dateViseIntervalBlock;
      } else {
        console.log("intervalBlock >> ", result.feed)
        return null
      }
    })
      .catch(error => {
        console.log('intervalBlock error =', error)
        return null
      })
  } catch (error) {
    console.log('intervalBlock Error ', error)
    return null
  }
}