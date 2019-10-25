const bcrypt = require('bcrypt');
const dotenv = require('dotenv').config();
const sequelize = require('../server/model/db');
const {findUser} = require('../server/model/User') 

module.exports.register = async function(req,res){
    const {firstName, lastName, streetAddress1, streetAddress2, city, zipCode, state, country,
          phone, email, password, accountTypeDetail } = req.body;
    const existingUser =  (await findUser(email)).length
          
    if(existingUser > 0){
      res.json({
        status:false,
        message:'Error: User already Exist'
      })
    } else {
      const salt = bcrypt.genSaltSync(process.env.APPSETTING_SALT_ROUNDS * 1);
      const hash  = bcrypt.hashSync(password, salt);
      const user = [firstName, lastName, streetAddress1, streetAddress2, city, zipCode, state, country, phone, email, hash, accountTypeDetail]
      const sql_insert =
        "INSERT INTO [dbo].[GCEP_Users](firstName, lastName, streetAddress1, streetAddress2, city"
        +", zipCode, state, country, phone, email, password, accountTypeDetail) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
      sequelize.query(sql_insert, {
        replacements: user,
        type: sequelize.QueryTypes.INSERT
      })
      .then(() => res.status(201).redirect('/'))
      .catch(error => res.sendStatus(400))
    }
}
