const axios = require('axios')
const moment = require('moment')
const AWS = require('aws-sdk')
const async = require('async')
const { sendAdminEmail, sendNotifyEmail, sendUserEmail } = require('../utils/email')
const { downloadFile, saveAsTxt, downloadContents } = require('../utils/downloadFile')
const { addLog, createLogItem } = require('../utils/errorTacker')
const { apiClient, retailCustomerDetails, usagePointDetails, meterReading, intervalBlock } = require('../utils/api')
const { findNestedObj } = require('../utils/utils')
const https = require('https')
var convert = require('xml-js')
const _ = require('lodash')
const jwt = require("jsonwebtoken");
var db = require('../models')
const {
  Token: { findByToken, createToken, updateToken },
  Log: { findAllLog, createLog, findLog }
} = require('../models')
const QueryTypes = require('sequelize').QueryTypes

const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_JWT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const handleToken = async function (authCode, tokenData) {
  try {
    console.log("handleToken Call", authCode)
    let token = await findByToken(authCode)

    const expiryDate = moment().add(1, 'hours').format()

    var msg = token !== undefined && token ? 'Token already existed' : 'Creating new token'
    createLogItem(true, 'Token Management', msg)

    tokenData.expiry_date = expiryDate
    const { access_token, refresh_token, expires_in, expiry_date, scope, resourceURI, authorizationURI, accountNumber, email, userId } = tokenData

    if (!access_token) {
      createLogItem(true, 'Token Management', "Token API Don't have valid contents")
      return false
    }

    // Decode Coned Access Token
    let conedToken = jwt.decode(access_token, { json: true });
    let conedSub = conedToken['sub']

    console.log("email ====> ", email);

    // Customer Details
    let customerDetails = await retailCustomerDetails(refresh_token, resourceURI);
    console.log("Customer Details DATA >> ", customerDetails)

    // UsagePoint ID
    let usagePointDetailsData = await usagePointDetails(refresh_token, resourceURI)
    let meterReadingId = await meterReading(refresh_token, resourceURI, usagePointDetailsData)

    let conedAddress
    let meterAccountId
    let usagePointId

    if (usagePointDetailsData) {
      conedAddress = customerDetails.address
      meterAccountId = customerDetails.meterAccountNumber
      usagePointId = usagePointDetailsData
    }

    let status
    if (token !== undefined && token.access_token) {
      // if (moment(token.expiry_date) < moment()) {
      status = await updateToken(authCode, {
        access_token,
        refresh_token,
        expires_in,
        expiry_date
      })
      console.log("token updateToken >>", status);
      msg = status ? 'Token updated successfully' : 'Token updating error'
      createLogItem(true, 'Token Management', msg, JSON.stringify(token))

      return token
    } else {
      let subscriptionId = resourceURI.split("/").pop();
      let authorizationId = authorizationURI.split("/").pop();

      //save new token.
      status = await createToken({
        authCode,
        access_token,
        refresh_token,
        expires_in,
        scope,
        email,
        subscriptionId,
        authorizationId,
        userId,
        conedSub,
        resourceURI,
        conedAddress,
        meterAccountId,
        usagePointId,
        meterReadingId,
        authorizationURI,
        accountNumber,
        expiry_date
      })
      console.log("token createToken >>", status);
      msg = status ? 'Token created successfully' : 'Token creating - Query Error'

      console.log('handleToken-token_create ===>', msg)
      createLogItem(true, 'Token Management', msg, JSON.stringify(token))

      return tokenData
    }
  } catch (error) {
    console.log('handleToken-error ===>', error)
    console.log('handleToken-error.response ===>', error.response)
    const errorJson = error && error.response ? error.response.data : error
    createLogItem(false, 'Token Management', 'Token handling issue', JSON.stringify(errorJson))

    return false
  }
}

exports.authenticateToken = async function (req, res) {
  try {
    //authorization code generated & sent by Utility
    const { code } = req.query

    console.log("code ===> ", code);
    console.log('session token ===> ', req.session)

    let email = ''
    let userId = ''
    if (req.session.token) {
      let tokenData = jwt.verify(req.session.token, APPSETTING_JWT_SECRET);
      console.log("tokenData ===> ", tokenData)
      email = tokenData.email
      userId = tokenData.userId
    }

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
      .post('https://api.coned.com/gbc/v1/oauth/v1/Token', data, {
        headers,
        httpsAgent: agent
      })
      .then(async response => {
        console.log('Token API Response', response.data || {})

        createLogItem(true, 'Token api working correctly', 'TOKEN CREATE API', JSON.stringify(response.data))

        const { data: tokenData } = response
        console.log("tokenData >>", tokenData);

        tokenData.email = email
        tokenData.userId = userId

        const resultData = await handleToken(code, tokenData)
        console.log("resultData >>", resultData);

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
        // createLogItem(false, 'Token api processing error', 'TOKEN CREATE API', JSON.stringify(errorJson))
        res.redirect('/callback?success=false')
      })
  } catch (error) {
    console.log('Catch Error', error)
    const errorJson = error && error.response ? error.response.data : error
    // createLogItem(false, 'Token api processing error', 'TOKEN CREATE API', JSON.stringify(errorJson))
    res.redirect('/callback?success=false')
  }
}


exports.externalAPI = async function (req, res) {
  try {
    //authorization code generated & sent by Utility
    const { refresh_token, resourceURI } = req.query

    console.log("refresh token ===> ", refresh_token);
    console.log('resource URI ===> ', resourceURI);


    let data1 = await retailCustomerDetails(refresh_token, resourceURI);
    console.log("Customer Details DATA >> ", data1)

    let usagePointDetailsData = await usagePointDetails(refresh_token, resourceURI)

    if (usagePointDetailsData) {
      let data = {
        conedAddress: data1.address,
        meterAccountId: data1.meterAccountNumber,
        usagePointId: usagePointDetailsData
      }
      data = await db.Token.update(data, {
        where: {
          subscriptionId: resourceURI
        }
      });
      console.log("update Usage id and address >>", data)
    }
    console.log("Customer Details usagePointDetailsData >> ", usagePointDetailsData)

    res.redirect(`/callback?success=true&usagePointDetailsData=${usagePointDetailsData}`)
  } catch (error) {
    console.log('externalAPI Error', error)
    res.redirect('/callback?success=false')
  }
}

exports.meterReadingAPI = async function (req, res) {
  try {
    //authorization code generated & sent by Utility
    const { refresh_token, resourceURI, usagePointId } = req.query

    console.log("refresh token ===> ", refresh_token);
    console.log('resource URI ===> ', resourceURI);
    console.log('usagePointId URI ===> ', usagePointId);

    let meterReadingId = await meterReading(refresh_token, resourceURI, usagePointId)
    console.log("Customer meterReadingId >> ", meterReadingId)

    if (meterReadingId) {
      let data = {
        meterReadingId: meterReadingId
      }
      data = await db.Token.update(data, {
        where: {
          subscriptionId: resourceURI
        }
      });
      console.log("update Meter id >> ", data)
    }

    res.redirect(`/callback?success=true&meterReadingId=${meterReadingId}`)
  } catch (error) {
    console.log('meterReadingAPI Error', error)
    res.redirect('/callback?success=false')
  }
}

exports.intervalBlockApi = async function (req, res) {
  try {
    //authorization code generated & sent by Utility
    const { refresh_token, resourceURI, usagePointId, meterReadingId, publishedMin, publishedMax } = req.query

    console.log("refresh token ===> ", refresh_token);
    console.log('resource URI ===> ', resourceURI);
    console.log('usagePointId URI ===> ', usagePointId);
    let token = await db.Token.findOne({
      where: {
        subscriptionId: resourceURI
      }
    })
    let intervalBlockData = await intervalBlock(refresh_token, resourceURI, usagePointId, meterReadingId, publishedMin, publishedMax, token.id)


    let data = await db.MeterReading.bulkCreate(intervalBlockData);
    console.log(data)

    console.log("Customer intervalBlockUrl >> ", intervalBlockData)
    res.status(200).send({ data: intervalBlockData })
  } catch (error) {
    console.log('meterReadingAPI Error', error)
    return res.status(500).send({ err: error, message: "error" })
    // res.redirect('/callback?success=false')
  }
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
    // let fileUrlList = {"_text":"https://api.coned.com/gbc/v1/resource/Batch/Download?requestId=24c2179f-71fd-415e-ab3b-a148e45eef7d&responseId=5a3a8e49-4802-4db7-9d3c-8279e87865f9"}
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

exports.deleteData = async function (req, res) {
  try {
    await db.sequelize.query(`DELETE FROM GCEP_Tokens;`, {
      type: QueryTypes.DELETE
    });

    let Tokens = await db.Token.findAll();

    return res.status(200).send({ message: "Successfully deleted", Token: Tokens })
  } catch (error) {
    console.log(error)
    return res.status(403).send({ message: "Error", error: error })
  }
}
