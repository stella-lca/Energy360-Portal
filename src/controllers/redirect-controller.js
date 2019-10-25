const dotenv = require('dotenv').config();

module.exports.redirect = function(req, res){
    const utilityProvider = req.session.user.accountTypeDetail;
    const CECONY_redir = `https://www.coned.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.APPSETTING_GREENCONNECT_ID}`; 
    const ORU_redir = `https://www.oru.com/accounts-billing/dashboard/billing-and-usage/share-my-data-connections/third-party-authorization?ThirdPartyId=${process.env.APPSETTING_GREENCONNECT_ID}`; 
   
  
    if(utilityProvider === 'CECONY'){
      res.send('This will be redirect to :'+ CECONY_redir)
      // res.redirect(CECONY_redir)
    } else if(utilityProvider === 'ORU'){
      res.send('This will be redirect to :'+ ORU_redir)
      // res.redirect(ORU_redir)
    }
  
    // res.status(500)
    // res.render('error', { error: err })
    
  }