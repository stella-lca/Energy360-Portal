const sequelize = require("./db");
const moment = require('moment');

/* Find token data from authCode*/
findToken = async function(authCode){
    const sql_select = "SELECT * FROM [dbo].[GCEP_Tokens] WHERE authCode = ? ";
    
    return (await sequelize.query(sql_select, {
      replacements: [authCode],
      type: sequelize.QueryTypes.SELECT
    }))

};

/* Update user data*/
updateToken = async function(authCode, newData){ //newData will be an object: key = column name and value = new info
  const currentDate = moment().format('YYYY-MM-DD HH:MM:SS')
  const keys = Object.keys(newData);
  const reducer = (accum, key) => (accum + `, ${key} = '${newData[key]}'`);
  const set = keys.reduce(reducer, `modifiedDate = '${currentDate}'`)
  const sql_update = `UPDATE [dbo].[GCEP_Tokens] SET ${set} WHERE authCode = ? `;
  
  return (await sequelize.query(sql_update, {
    replacements: [authCode],
    type: sequelize.QueryTypes.UPDATE
  }))

};

createToken = function(tokenData){
  const sql_insert =
    "INSERT INTO [dbo].[GCEP_Tokens](authCode, access_token, refresh_token, expires_in, expiry_date, scope, resouceURI, authorizationURI) VALUES(?, ?, ?, ?, ?, ?, ?, ?)";

  sequelize.query(sql_insert, {
    replacements: tokenData,
    type: sequelize.QueryTypes.INSERT
  })
  .then(() => res.json({
            status:true,
            data: tokenData,
            message:'token generated sucessfully'
        }))
  .catch(error => res.json({
    status:false,
    message:'Error: there are some error with query. '+ console.log(error)
  }))
  
};
  
module.exports = {
  findToken,
  updateToken,
  createToken
};