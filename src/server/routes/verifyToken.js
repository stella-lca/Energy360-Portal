module.exports = function(req, res,next){
  if(req.session.loggedIn){
    res.status(200)
    next();
  } else {
    res.sendStatus(403)
  }
}