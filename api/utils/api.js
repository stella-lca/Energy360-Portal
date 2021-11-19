const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('./errorTacker')

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
      console.log("Customer Details DATA >> ", data)
      return data;
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
      console.log("usagePointDetails >> ", data)
      return data;
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