const cron = require('node-cron');
var db = require('../models')
const { generateThirdPartyToken } = require('../utils/api')
const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('../utils/errorTacker');
const xml2jsObj = require('xml-js');
const moment = require('moment');
const _ = require('lodash');
require('dotenv').config()

const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const agent = new https.Agent({
    rejectUnauthorized: false
})

const meterReading = () => {

    cron.schedule('* * * * *', async () => {
        console.log('running a task every two minutes');
        let Token = await db.Token.findAll();
        console.log("Tokens >>", Token);
        for (let i = 0; i < Token.length; i++) {
            let element = Token[i];

            try {
                let AUTH_TOKEN = await generateThirdPartyToken(element.refreshToken, element.subscriptionId)

                let headers = {
                    'content-type': 'application/json',
                    'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
                    'Authorization': 'Bearer ' + AUTH_TOKEN
                }

                let { data } = await axios({
                    method: 'get',
                    url: `https://api.coned.com/gbc/v1/resource/Subscription/${element.subscriptionId}/UsagePoint/${element.usagePointId}/MeterReading/${element.meterReadingId}/IntervalBlock?publishedMin=${publishedMin}&publishedMax=${publishedMax}`,
                    timeout: 100000,
                    headers,
                    httpsAgent: agent,
                    maxContentLength: 100000000,
                    maxBodyLength: 100000000
                })
                let result = xml2jsObj.xml2js(data, { compact: true, spaces: 4 });

                let KVARH = false
                let dateViseIntervalBlock = {}
                let resultArray = []
                console.log('result.feed.entry >> ', result.feed.entry);
                if (!result.feed.entry.length) {
                    resultArray.push(result.feed.entry);
                } else {
                    resultArray = result.feed.entry
                }
                for (let j = 0; j < resultArray.length; j++) {
                    const element = resultArray[j];
                    let links = element.link
                    for (let a = 0; a < links.length; a++) {
                        const linkElement = links[a];
                        if (linkElement._attributes.href.includes('KVARH')) {
                            KVARH = true
                        } else {
                            KVARH = false
                        }
                    }
                    let intervalBlocks = element.content['espi:intervalBlocks']['espi:intervalBlock']

                    if (intervalBlocks.length > 0) {

                        for (let i = 0; i < intervalBlocks.length; i++) {
                            const intervalBlockElement = intervalBlocks[i];

                            let timestamp = intervalBlockElement['espi:interval']['espi:start']._text

                            let intervalReading = intervalBlockElement['espi:intervalReading']
                            intervalReading = intervalReading.map(e => Number(e['espi:value']._text));

                            let intervalReadingTotal = _.sum(intervalReading);
                            console.log(intervalReadingTotal);
                            let date = moment.unix(timestamp).format('YYYY-MM-DD');
                            if (KVARH) {
                                dateViseIntervalBlock[date] = {
                                    date: date,
                                    KVARHReading: intervalReadingTotal,
                                    tokenId: tokenId,
                                    KWHReading: null
                                }
                            } else {
                                dateViseIntervalBlock[date].KWHReading = intervalReadingTotal
                            }
                        }
                    }
                }
                console.log("dateViseIntervalBlock >> ", dateViseIntervalBlock)
                let array = []
                for (const property in dateViseIntervalBlock) {
                    array.push(dateViseIntervalBlock[property]);
                }
                console.log("array >>", array);

            } catch (error) {
                console.log('intervalBlock Error ', error)
            }
        }
    });
}

module.exports = {
    meterReading
}