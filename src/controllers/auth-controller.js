// const dotenv = require('dotenv');
const {findUser} = require('../server/model/User') 
const bcrypt = require('bcrypt');
const axios = require('axios')
const sequelize = require('../server/model/db')
module.exports.authenticate = function(req,res){
    const {email, password}=req.body;
    // const user = {email, password}

    // sequelize.query(sql_select, {
    //   replacements: [user.email],
    //   type: sequelize.QueryTypes.SELECT
    // })
    // .then(async users => {
    //   if(users.length > 0){
    //     // const validPassword = await bcrypt.compareSync(user.password, users[0].password);

    //     if(!bcrypt.compareSync(user.password, users[0].password)){
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
    // .cath(err => 
    //   res.json({
    //     status:false,
    //     message:'Error: there are some error with query'
    //   }) 
    // )

    findUser(email)
    .then( users => {
      if(users.length >0){
       if(bcrypt.compareSync(password, users[0].password)){
        // console.log(users[0])
        // axios.get(`https://jsonplaceholder.typicode.com/users`)
        // .then(res => console.log(res))

        (axios.post('http://localhost:3000/api/sessions', users[0]))
        .then(res => res.data)
        .then(user => {

          // res.json({
          //   status:true,
          //   message:'successfully authenticated',
          //   token: user.token
          // })
          req.session.token = user.token
          res.redirect('/')
        })
        .catch(err => console.log(err))
        // window.localStorage.setItem('token', token)
        // axios.post('http://localhost:3000/api/sessions', users[0])
        // .then(data => console.log(data))
        // const {token} = await (axios.post('http://localhost:3000/api/sessions', users[0])).data
      
       }else{
        res.json({
          status:false,
          message:"Error: email and password do not match"
        });
       }
   }
    })
    .catch( error => 
      res.json({
        status:false,    
        message: error
      })
    )

}
