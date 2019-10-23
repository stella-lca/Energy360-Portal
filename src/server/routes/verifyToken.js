module.exports = function(req, res,next){
  console.log(req.session)
  if(req.session.loggedIn && req.session.accountType){
    res.status(200)
    next();
  } else {
    res.status(403).redirect('/')
  }
}