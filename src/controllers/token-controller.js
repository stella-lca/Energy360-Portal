const { findToken, createToken, updateToken } = require("../server/model/Token");
const axios = require("axios");
const dotenv = require('dotenv').config();
const moment = require('moment')

const accessTokenGenerator =  async function(data, headers){
  try{
    const newToken = (await axios.post('https://apit.coned.com/gbc/v1/oauth/v1/token', data, {headers})).data

    //access token will be expired in 1 hour
    const expiryDate = moment().add(1, 'hours').format('YYYY-MM-DD HH:MM:SS');
    newToken.expiry_date = expiryDate;
    return newToken;
  } catch (error){
    console.log(error)
  }
}

module.exports.authenticateToken = async function(req, res) {
  //authorization code generated & sent by Utility
  const {authCode} = req.body;
  let tokenData = {};
  const headers= {
    'content-type': 'application/json',
    'ocp-apim-subscription-key': process.env.headers,
  }
  const data = {
    "grantType":"client_credentials",
    "clientId": process.env.CLIENT_ID,
    "clientSecret": process.env.CLIENT_SECRET,
    "redirectUri": "<<registred redirect uri>>",
    "authCode" : authCode,
    // "scope": session.user.scope
  }
  
  try{
    const tokens  = (await findToken(authCode)).data

    if(tokens.length === 0){
      // request new token data
      const tokenData = (await accessTokenGenerator(data, headers)).data 
      
      // save in database
      const {access_token, refresh_token, expires_in, expiry_date, scope, resouceURI, authorizationURI} = tokenData
      tokenData = (await createToken({authCode, access_token, refresh_token, expires_in, expiry_date, scope, resouceURI, authorizationURI})).data

    } else if( tokens[0].expiry_date < moment().format('YYYY-MM-DD HH:MM:SS')){
      //If token is expired, then generate new token
      const tokenData = (await accessTokenGenerator(data, headers)).data 

      //update the token data
      const {access_token, refresh_token, expires_in, expiry_date, scope, resouceURI, authorizationURI} = tokenData
      tokenData = (await updateToken({expires_in, expiry_date, scope, authorizationURI})).data
    } 
    //save in session
    req.session.shareMyDataToken = tokenData;
    
  } catch(error){
    res.json({
        status: false,
        message: error
      })
  }
};