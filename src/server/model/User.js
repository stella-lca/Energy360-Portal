const sequelize = require("./db");
const dotenv = require('dotenv').config();
const jwt = require("jwt-simple");
const moment = require('moment');

/* Search the user by email*/
findUser = async function(email){
    const sql_select = "SELECT * FROM [dbo].[GCEP_Users] WHERE email = ? ";
    
    return (await sequelize.query(sql_select, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    }))

};


/* Update user data*/
updateUser = async function(userID, newData){ //newData will be an object: key = column name and value = new info
  const currentDate = moment().format('YYYY-MM-DD HH:MM:SS');
  const keys = Object.keys(newData);
  const reducer = (accum, key) =>(accum + `, ${key} = '${newData[key]}'`);
  const set = keys.reduce(reducer, `modifiedDate = GETDATE()`);
  const sql_update = `UPDATE [dbo].[GCEP_Users] SET ${set} WHERE id = ? `;
  
  return (await sequelize.query(sql_update, {
    replacements: [userID],
    type: sequelize.QueryTypes.UPDATE
  }))

};
  
/* Find the user by authorization token*/
findByToken = async function(token){
  try{
    const sql_selectByID = "SELECT * FROM [dbo].[GCEP_Users] WHERE id = ? "
    const {id} = jwt.decode(token, process.env.APPSETTING_JWT_SECRET);

    const users = await sequelize.query(sql_selectByID, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT
    });

    if(users.length>0){
      return users[0]
    }
    throw({status: 401})
  }
  catch(ex){
    throw({status:401})
  }

}

/* Save new user */
createUser = function(user){
  const sql_insert =
    "INSERT INTO [dbo].[GCEP_Users](firstName, lastName, streetAddress1, streetAddress2, city"
    +", zipCode, state, country, phone, email, password, accountTypeDetail) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

  sequelize.query(sql_insert, {
    replacements: user,
    type: sequelize.QueryTypes.INSERT
  })
  .then(() => res.json({
            status:true,
            data:user,
            message:'user registered sucessfully'
        }))
  .catch(error => res.json({
    status:false,
    message:'Error: there are some error with query. '+ console.log(error)
  }))

};

//deleteUser -- need to include this in user account option
deleteUser = async function(user){
    const sql_delete = "DELETE FROM [dbo].[GCEP_Users] WHERE email = ? ";
    
    await sequelize.query(sql_delete, {
        replacements: [user.email],
        type: sequelize.QueryTypes.DELETE
    })

    return user.email
};

/* Find the user by authorization token*/
valifyResetPasswordToken = async function(token){
  try{
    const sql_select = "SELECT * FROM [dbo].[GCEP_Users] WHERE resetPasswordToken = ? "

    const users = await sequelize.query(sql_select, {
      replacements: [token],
      type: sequelize.QueryTypes.SELECT
    });
    const currentDate = moment().format('YYYY-MM-DD HH:MM:SS');
    const user = users[0];

    if(users.length > 0 && currentDate < moment(user.resetPasswordExpires).format('YYYY-MM-DD HH:MM:SS')){
      return true
    }
    return false
  }
  catch(ex){
    throw({status:401})
  }
}

/* Update user data*/
updatePassword = async function(token, newPassword){ //newData will be an object: key = column name and value = new info
  const salt = bcrypt.genSaltSync(process.env.APPSETTING_SALT_ROUNDS * 1);
  const hash  = bcrypt.hashSync(newPassword, salt);
  const currentDate = moment().format('YYYY-MM-DD HH:MM:SS');
  const set =`password = '${hash}', resetPasswordToken = NULL , resetPasswordExpires = NULL, modifiedDate = GETDATE()`;
  const sql_update = `UPDATE [dbo].[GCEP_Users] SET ${set} WHERE resetPasswordToken = ? `;
  
  return (await sequelize.query(sql_update, {
    replacements: [token],
    type: sequelize.QueryTypes.UPDATE
  }));

};
  
// findUser({email: 'stella@cutone.org'}).then(user => console.log(user))

// deleteUser({email: 'k@gmail.com'}).then(deletedEmail => console.log(`User email: ${deletedEmail} is deleted`))

// console.log(createUser({
//     firstName: 'Stella',
//     lastName: 'Kim',
//     streetAddress1: '123nd', 
//     streetAddress2: '12', 
//     city: 'New York', 
//     zipCode: 11111, 
//     state: 'NY', 
//     country: 'United States', 
//     phone: '4567891234', 
//     email: 'test@test.com', 
//     password: '123456', 
//     accountTypeDetail: 'CECONY'
// }))
  
  module.exports = {
    findUser,
    createUser,
    findByToken,
    updateUser,
    deleteUser,
    valifyResetPasswordToken,
    updatePassword,
  };
