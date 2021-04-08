const axios = require('axios')
const moment = require('moment')
const AWS = require('aws-sdk')
const async = require('async')
const { sendAdminEmail, sendNotifyEmail, sendUserEmail } = require('../utils/email')
const { downloadFile, saveAsTxt, downloadContents } = require('../utils/downloadFile')
const { addLog, createLogItem } = require('../utils/errorTacker')
const { apiClient } = require('../utils/api')
const { findNestedObj } = require('../utils/utils')
const https = require('https')
var convert = require('xml-js')
const _ = require('lodash')

const {
  Token: { findByToken, createToken, updateToken },
  Log: { findAllLog, createLog, findLog }
} = require('../models')

const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const handleToken = async function (authCode, tokenData) {
  let token = await findByToken(authCode)
  const expiryDate = moment().add(1, 'hours').format()

  var msg = token !== undefined && token ? 'Token already existed' : 'Creating new token'
  createLogItem(true, 'Token Management', msg)

  tokenData.expiry_date = expiryDate
  const { access_token, refresh_token, expires_in, expiry_date, scope, resourceURI, authorizationURI, accountNumber } = tokenData

  if (!access_token) {
    createLogItem(true, 'Token Management', "Token API Don't have valid contents")
    return false
  }

  try {
    let status
    if (token !== undefined && token.access_token) {
      // if (moment(token.expiry_date) < moment()) {
      status = await updateToken(authCode, {
        access_token,
        refresh_token,
        expires_in,
        expiry_date
      })

      msg = status ? 'Token updated successfully' : 'Token updating error'
      createLogItem(true, 'Token Management', msg, JSON.stringify(token))

      return token
    } else {
      //save new token.
      status = await createToken({
        authCode,
        access_token,
        refresh_token,
        expires_in,
        scope,
        resourceURI,
        authorizationURI,
        accountNumber,
        expiry_date
      })

      msg = status ? 'Token created successfully' : 'Token creating - Query Error'

      console.log('handleToken-token_create ===>', msg)
      createLogItem(true, 'Token Management', msg, JSON.stringify(token))

      return tokenData
    }
  } catch (error) {
    console.log('handleToken-error ===>', error.response)
    const errorJson = error && error.response ? error.response.data : error
    createLogItem(false, 'Token Management', 'Token handling issue', JSON.stringify(errorJson))

    return false
  }
}

exports.authenticateToken = async function (req, res) {
  //authorization code generated & sent by Utility
  const { code } = req.query

  const headers = {
    'content-type': 'application/json',
    'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY
  }

  const data = {
    grantType: 'authorization_code',
    clientId: APPSETTING_CLIENT_ID,
    clientSecret: APPSETTING_CLIENT_SECRET,
    redirectUri: `${APPSETTING_HOST}/auth/callback`,
    authCode: code
  }
  //   const data = {
  // 	"grantType": "client_credentials",
  // 	"clientId": APPSETTING_CLIENT_ID,
  // 	"clientSecret": APPSETTING_CLIENT_SECRET,
  // 	"Scope":"FB=3_35_47"
  //   }
  //   const data = {
  //     "grantType":"refresh_token",
  //     "ClientId" : APPSETTING_CLIENT_ID,
  //     "ClientSecret": APPSETTING_CLIENT_SECRET,
  //     "refreshToken": "xgLjx5_OwhzhqBN1I_w8Aw6vJiKRYXGjm4DbUDI1src",
  //     "subscriptionId": 764
  // }

  const agent = new https.Agent({
    rejectUnauthorized: false
  })

  createLogItem(true, 'Requesting token create API', 'TOKEN CREATE API', JSON.stringify({ headers, data }))

  axios
    .post('https://apit.coned.com/gbc/v1/oauth/v1/Token', data, {
      headers,
      httpsAgent: agent
    })
    .then(async response => {
      console.log('Token API Response', response.data || {})

      createLogItem(true, 'Token api working correctly', 'TOKEN CREATE API', JSON.stringify(response.data))

      const { data: tokenData } = response
      const resultData = await handleToken(code, tokenData)

      createLogItem(true, 'Token api working correctly', 'TOKEN DB MANAGEMENT', JSON.stringify(resultData))

      if (resultData && resultData.access_token) {
        res.redirect('/callback?success=true')
      } else {
        res.redirect('/callback?success=false')
      }
    })
    .catch(error => {
      console.log('Token api processing error', error)
      const errorJson = error && error.response ? error.response.data : error
      createLogItem(false, 'Token api processing error', 'TOKEN CREATE API', JSON.stringify(errorJson))
      res.redirect('/callback?success=false')
    })
}

exports.notifyCallback = async function (req, res) {
  try {
    var options = {
      compact: true,
      trim: true,
      indentCdata: false,
      spaces: 0,
      ignoreComment: true,
      alwaysChildren: true,
      ignoreInstruction: true,
      ignoreDoctype: true
    }
    createLogItem(true, 'N-1 ---> Notify API Response', ``)

    const validXMLText = req.testBody.replace(/&(?!(?:apos|quot|[gl]t|amp);|#)/g, '&amp;')
    var xmlDoc = convert.xml2js(validXMLText, options)

    // const list = await findAllLog();
    // console.log("Utilify API REQUEST ===>", req.body);
    createLogItem(true, 'N-2 ---> Parsed Notofiy Response', ``)

    let fileUrlList = await findNestedObj(xmlDoc, 'espi:resources')
    // let fileUrlList = {"_text":"https://apit.coned.com/gbc/v1/resource/Batch/Download?requestId=24c2179f-71fd-415e-ab3b-a148e45eef7d&responseId=5a3a8e49-4802-4db7-9d3c-8279e87865f9"}
    createLogItem(true, 'N-3 ---> Parsed Links Object', JSON.stringify(fileUrls))

    var fileUrls = [];
    if (fileUrlList !== undefined) {
      if (_.isEmpty(fileUrlList.length)) {
        fileUrls = [fileUrlList._text]
      } else {
        fileUrls = fileUrlList.map(item => item._text)
      }

      createLogItem(true, 'N-4 ---> Parsed File Links', JSON.stringify(fileUrls))

      let publicLinks = []
      for (let i = 0; i < fileUrls.length; i++) {
        const linkItem = await downloadContents(fileUrls[i])
        if (linkItem) publicLinks.push(linkItem)
      }

      if (publicLinks.length > 0) {
        createLogItem(true, 'N-5 ---> Final Results', JSON.stringify(publicLinks))
        sendUserEmail({
          content: { files: publicLinks },
          subject: 'GreenConnect - Utility API Response'
        })
        return res.status(200).send('success')
      }

      createLogItem(true, 'N-5 ---> No Content in Notify', '')
      sendAdminEmail({
        content: 'Received the utility callback, content is empty',
        subject: 'GreenConnect - Utility API Response'
      })
      return res.status(200).send('no contents')
    } else {
      createLogItem(false, 'N4 ---> Empty File Links', '')
      sendAdminEmail({
        content: 'Received the utility callback, content is empty',
        subject: 'GreenConnect - Utility API Response'
      })
      return res.status(200).send('no contents')
    }
  } catch (error) {
    try {
      createLogItem(false, 'Notify Parsing Exception', '')
      sendAdminEmail({
        content: 'Utility callback error',
        subject: 'GreenConnect - Utility API Response'
      })
      return res.status(500).end('internal server error')
    } catch (e) {
      createLogItem(false, 'Server Error in Notify', '')
      res.status(500).end('internal server error')
      throw e
    }
  }
}
