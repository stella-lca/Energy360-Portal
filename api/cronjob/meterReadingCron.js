const cron = require('node-cron');
var db = require('../models')
const { generateThirdPartyToken, intervalBlock } = require('../utils/api')
const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('../utils/errorTacker');
const xml2jsObj = require('xml-js');
const moment = require('moment');
const _ = require('lodash');
const { checkIfDateIsBetweenTwoDates, getMonthsBeforeGivenDate, getWeeksStartAndEndInMonth } = require('../utils/utils');
var Op = require('sequelize').Op;
require('dotenv').config()
const momentTZ = require('moment-timezone');


const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const agent = new https.Agent({
    rejectUnauthorized: false
})

const meterReading = () => {

    cron.schedule('* * * * *', async () => {
        console.log('running a task every two minutes  ');
        let Token = await db.Token.findAll();

        var sone = momentTZ.tz.guess();
        var timezone = momentTZ.tz(sone).zoneAbbr()

        let msg = 'Azure TimeZone'
        createLogItem(true, 'Time Zone', msg, moment().format('ZZ') + ", " + timezone)

        console.log("Tokens >>", JSON.stringify(Token));
        for (let i = 0; i < Token.length; i++) {
            let tokenElement = Token[i];

            try {
                let AUTH_TOKEN = await generateThirdPartyToken(tokenElement.refresh_token, tokenElement.subscriptionId)

                let headers = {
                    'content-type': 'application/json',
                    'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
                    'Authorization': 'Bearer ' + AUTH_TOKEN
                },
                    firstDayOfYear = moment().startOf('year').format('YYYY-MM-DD');

                let meterReading = await db.MeterReading.findAll({
                    where: {
                        tokenId: tokenElement.id,
                        date: { [Op.gt]: firstDayOfYear }
                    }
                })

                if (meterReading.length > 0) {
                    let readingDate = moment().format('YYYY-MM-DD');
                    let obj = {
                        subscriptionId: tokenElement.subscriptionId,
                        usagePointId: tokenElement.usagePointId,
                        meterReadingId: tokenElement.meterReadingId,
                        startDate: readingDate,
                        endDate: readingDate,
                        tokenId: tokenElement.id
                    }
                    let array = await intervalBlock(headers, obj)
                    await db.MeterReading.bulkCreate(array);
                } else {

                    let d = new Date(),
                        year = moment().year()

                    let months = getMonthsBeforeGivenDate(d);
                    let weeksDates = []
                    for (let i = 0; i < months.length; i++) {
                        const element = months[i];
                        let array = getWeeksStartAndEndInMonth(element, year, "monday");
                        weeksDates = weeksDates.concat(array)
                    }

                    console.log('weeksDates >> ', weeksDates)
                    let msg = 'array await weeksDates'
                    createLogItem(true, 'Week Dates', msg, JSON.stringify(weeksDates))

                    let MeterReadingTillDate = [],
                        lastWeek = false
                    for (let i = 0; i < weeksDates.length; i++) {
                        let weeksDatesElement = weeksDates[i];
                        if (checkIfDateIsBetweenTwoDates(moment(d).format('YYYY-MM-DD'), weeksDatesElement)) {
                            weeksDatesElement = { startDate: weeksDatesElement.startDate, endDate: moment(d).format('YYYY-MM-DD') }
                            lastWeek = true
                        }
                        let obj = {
                            subscriptionId: tokenElement.subscriptionId,
                            usagePointId: tokenElement.usagePointId,
                            meterReadingId: tokenElement.meterReadingId,
                            startDate: "2022-01-01",
                            endDate: "2022-01-06",
                            tokenId: tokenElement.id
                        }

                        let array = await intervalBlock(headers, obj)

                        MeterReadingTillDate.concat(array)
                        if (lastWeek) {
                            break
                        }
                    }
                    console.log(MeterReadingTillDate)
                    let msg = 'MeterReadingTillDate'
                    createLogItem(true, 'MeterReadingTillDate', msg, JSON.stringify(MeterReadingTillDate))

                    let data = await db.MeterReading.bulkCreate(MeterReadingTillDate);
                    console.log(data)
                }

            } catch (error) {
                let msg = 'CRON ERROR'
                createLogItem(true, 'CRON ERROR', msg, error)
                console.log('intervalBlock Error ', error)
            }
        }
    });
}

module.exports = {
    meterReading
}