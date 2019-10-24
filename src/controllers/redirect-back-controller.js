const dotenv = require('dotenv').config();

module.exports.redirectBack = function(req, res){
    const {scope} = req.body
  
    if(req.session !== undefined && req.session.user !== undefined ){
      const utilityProvider = req.session.user.accountTypeDetail;
      const ceconyRedirectBackURL = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?`
                                  +`client_id=${process.env.CLIENT_ID}`
                                  +`&scope=${scope}`
      const oruRedirectBackURL = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?`
                                  +`client_id=${process.env.CLIENT_ID}`
                                  +`&scope=${body}`
      
      if(utilityProvider === 'CECONY'){
        res.send('This will be redirect to '+ ceconyRedirectBackURL)
        // res.redirect(ceconyRedirectBackURL)
      } else if(utilityProvider === 'ORU'){
        res.send('This will be redirect to '+ oruRedirectBackURL)
        // res.redirect(oruRedirectBackURL)
      }
    } else {
      res.status(403).send(`Forbidden. Please login to use GreenConnect.`)
    }
    
    // res.render('error', { error: err })
  }