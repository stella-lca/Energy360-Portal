module.exports = function(req, res, next){
  req.session.redirectUrl = req.originalUrl || req.url 
  if(req.session.loggedIn && req.session.user.accountTypeDetail){
    res.status(200)
    next();
  } else {  
    res.status(403).redirect('/')
  }
}
