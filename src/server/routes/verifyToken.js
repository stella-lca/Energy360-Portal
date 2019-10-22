const {findByToken} = require('../../server/model/User') 

module.exports = async function(req, res, next){
    const token = req.header('authorization');
    // const token = req.headers.authorization

    if(!token) return res.status(401).send('Access Denied');
    
    try{
        const user = await findByToken(authorization)
        req.user = user
        next()
    }catch(ex){
        res.status(400).send('Invalid Token');
    }
} 

