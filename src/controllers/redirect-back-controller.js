const dotenv = require('dotenv').config();
const {updateUser} = require('../server/model/User') 

module.exports.redirectBack = async function(req, res){
    const {scope} = req.body;
    const scopes = scope.join("|");
    
    if(req.session !== undefined && req.session.user !== undefined ){
      await updateUser(req.session.user.id, {scopes})

      const utilityProvider = req.session.user.accountTypeDetail;
      const ceconyRedirectBackURL = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?`
                                  +`client_id=${process.env.APPSETTING_CLIENT_ID}`
                                  +`&scope=${scopes}`
      const oruRedirectBackURL = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization/redirect?`
                                  +`client_id=${process.env.APPSETTING_CLIENT_ID}`
                                  +`&scope=${scopes}`
      
      if(utilityProvider === 'CECONY'){
//      res.send('This will be redirect to '+ ceconyRedirectBackURL)
        res.redirect(ceconyRedirectBackURL)
      } else if(utilityProvider === 'ORU'){
//         res.send('This will be redirect to '+ oruRedirectBackURL)
        res.redirect(oruRedirectBackURL)
      }
    } else {
      res.status(403).send(`Forbidden. Please login to use GreenConnect.`)
    }
    
    // res.render('error', { error: err })
  }
