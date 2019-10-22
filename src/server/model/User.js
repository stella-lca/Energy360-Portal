const sequelize = require("./db");
const dotenv = require('dotenv').config();
const jwt = require("jwt-simple");

const findUser = async (email) => {
    const sql_select = "SELECT * FROM [dbo].[GCEP_Users] WHERE email = ? ";
    
    return (await sequelize.query(sql_select, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    }))

};
  
findByToken = async function(token){
  try{
    const sql_selectByID = "SELECT * FROM [dbo].[GCEP_Users] WHERE id = ? "
    const {id} = jwt.decode(token, process.env.JWT_SECRET);
    
    const users = await sequelize.query(sql_selectByID, {
      replacements: [id],
      type: sequelize.QueryTypes.SELECT
    })

    if(users.length>0){
      return users[0]
    }
    throw({status: 401})
  }
  catch(ex){
    throw({status:401})
  }
}

const createUser = (user) => {

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
    message:'Error: there are some error with query'+console.log(error)
  }))

};

//deleteUser -- need to include this in user account option
const deleteUser = async user => {
    const sql_delete = "DELETE FROM [dbo].[GCEP_Users] WHERE email = ? ";
    
    await sequelize.query(sql_delete, {
        replacements: [user.email],
        type: sequelize.QueryTypes.DELETE
    })

    return user.email
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
    findByToken
  };