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
  baseURL: 'https://apit.coned.com/gbc/v1/',
  timeout: 10000,
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
      createLogItem(true, '1---> Client Token', AUTH_TOKEN)

      instance.defaults.headers.common['Authorization'] = 'Bearer ' + AUTH_TOKEN
    }
    return instance
  } catch (error) {}
}
