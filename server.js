const express = require('express')
const helmet = require('helmet')
const http = require('http')
const bodyParser = require('body-parser')
const path = require('path')
const app = express()

const {port} = require('./config')

app.use(helmet())

// Express Route File Requires
const __apiName = require('./api/name.js')
const __apiUser = require('./api/user.js')

// <REQUIRES> DON'T CHANGE THIS LINE - Express route file requires will be added above here.

app.use(express.static(path.resolve(__dirname, 'dist')))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false }))

// Express Routing
app.use('/api/name', __apiName)
app.use('/api/user', (req, res) => res.send({hi: 'there'}))

// <ROUTING-E> DON'T CHANGE THIS LINE - Express routing will be added above here.

// React Routing
app.get('*', (req, res)=> {
   res.sendFile(path.join(__dirname, 'dist/index.html'));
 });

// <ROUTING-R> DON'T CHANGE THIS LINE - React routing will be added above here.


http.createServer(app).listen(port, ()=>{
   console.log(`Server running at http://localhost:${port}/`);
})

module.exports = app
