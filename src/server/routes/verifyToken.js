const {findByToken} = require('../../server/model/User') 
const jwt = require('jsonwebtoken')

module.exports = async function(req, res, next){
    // Get auth header value
    const bearerHeader = req.headers['authorization'];
    // Check if bearer is undefined
    if(typeof bearerHeader !== 'undefined') {
    // Split at the space
    // Get token from array
    const bearerToken = bearerHeader.split(' ')[1];
    // Set the token
    req.query.token = bearerToken;
    // Next middleware
    next();
  } else {
    // Forbidden
    res.sendStatus(403);
  }


    // const token = req.header('authorization');
    // // const token = req.headers.authorization

    // if(!token) return res.status(401).send('Access Denied');
    
    // try{
    //     const user = await findByToken(authorization)
    //     req.user = user
    //     next()
    // }catch(ex){
    //     res.status(400).send('Invalid Token');
    // }
} 

