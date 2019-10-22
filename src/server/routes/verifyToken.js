const {findByToken} = require('../../server/model/User') 

module.exports = function(req, res, next){
  const bearerHeader = req.headers['authorization'];

  if(typeof bearerHeader !== 'undefined') {
    const bearerToken = bearerHeader.split(' ')[1];
    // Set the token
    req.token = bearerToken;
    next();
  } else {
    // Forbidden
    res.sendStatus(403)
  }
} 

