module.exports = function(req, res, next){

  if(req.session.loggedIn && req.session.user.accountTypeDetail){
    res.status(200)
    next();
  } else {
    req.session.redirectUrl = req.originalUrl || req.url 
    res.status(403).redirect('/')
  }
  
}