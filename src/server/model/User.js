const sequelize = require("./db");
const dotenv = require('dotenv').config();
const bcrypt = require("bcrypt");

const findUser = async (email) => {
    const sql_select = "SELECT * FROM [dbo].[GCEP_Users] WHERE email = ? ";
    
    return (await sequelize.query(sql_select, {
      replacements: [email],
      type: sequelize.QueryTypes.SELECT
    }))

    // sequelize.query(sql_select, {
    //   replacements: [user.email],
    //   type: sequelize.QueryTypes.SELECT
    // })
    // .then(users => {
    //   if(users.length > 0){
    //     const validPassword = bcrypt.compare(user.password, users[0].password);

    //     if(!validPassword){
    //       res.json({
    //         status:false,
    //         message:"Error: email and password do not match"
    //       })
    //     } else {
    //       res.json({
    //         status:true,
    //         message:'successfully authenticated'
    //       })
    //     }
    //   } 
    // })
    // .catch(err => 
    //   res.json({
    //     status:false,
    //     message:'Error: there are some error with query'
    //   })
    // )
  };
  
 const createUser = (user) => {
  // const salt = bcrypt.genSaltSync(process.env.SALT_ROUNDS * 1);
  //   const hash  = bcrypt.hashSync(user.password, salt);
    // user.password = hash

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
//     firstName: 'test',
//     lastName: 'Kim',
//     streetAddress1: '123nd', 
//     streetAddress2: '12', 
//     city: 'New York', 
//     zipCode: 11001, 
//     state: 'NY', 
//     country: 'United States', 
//     phone: '4567894561', 
//     email: 'k@gmail.com', 
//     password: '456789', 
//     accountTypeDetail: 'CECONY'
// }))
  
  module.exports = {
    findUser,
    createUser
  };