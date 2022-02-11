const cron = require('node-cron');
var db = require('../models')
const { generateThirdPartyToken, intervalBlock } = require('../utils/api')
const axios = require('axios')
const https = require('https')
const { addLog, createLogItem } = require('../utils/errorTacker');
const xml2jsObj = require('xml-js');
const moment = require('moment');
const _ = require('lodash');
const { checkIfDateIsBetweenTwoDates, getMonthsBeforeGivenDate, getWeeksStartAndEndInMonth, subtractDay, comparerArray } = require('../utils/utils');
var Op = require('sequelize').Op;
require('dotenv').config()


const { APPSETTING_HOST, APPSETTING_CLIENT_ID, APPSETTING_CLIENT_SECRET, APPSETTING_SUBSCRIPTION_KEY } = process.env

const meterReading = () => {

    cron.schedule('*/2 * * * *', async () => {
        console.log('running a task every two minutes  ');
        let Token = await db.Token.findAll();

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

                    let readingEndDate = moment().format('YYYY-MM-DD');
                    let readingStartDate = subtractDay(readingEndDate)

                    let obj = {
                        subscriptionId: tokenElement.subscriptionId,
                        usagePointId: tokenElement.usagePointId,
                        meterReadingId: tokenElement.meterReadingId,
                        startDate: readingStartDate,
                        endDate: readingEndDate,
                        tokenId: tokenElement.id
                    }

                    let todayReading = meterReading.filter(e => e.date === readingEndDate)
                    let yesterdayReading = meterReading.filter(e => e.date === readingStartDate)

                    let intervalBlockData = await intervalBlock(headers, obj)
                    if (todayReading && todayReading.length === 0 || yesterdayReading && yesterdayReading.length === 0) {
                        let intervalBlockToday
                        if (yesterdayReading.length > 0) {
                            intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate)
                        } else {
                            intervalBlockToday = intervalBlockData.filter(e => e.date == readingEndDate || e.date == readingStartDate)
                        }
                        let data = await db.MeterReading.bulkCreate(intervalBlockToday);
                        createLogItem(true, 'intervalBlockToday', "intervalBlockToday Added", JSON.stringify(data))

                    }
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

                    let MeterReadingTillDate = [],
                        lastWeek = false
                    for (let i = 0; i < weeksDates.length; i++) {
                        let weeksDatesElement = weeksDates[i];
                        if (checkIfDateIsBetweenTwoDates(moment(d).format('YYYY-MM-DD'), weeksDatesElement)) {
                            weeksDatesElement = { startDate: weeksDatesElement.startDate, endDate: moment(d).format('YYYY-MM-DD') }
                            if (weeksDatesElement.startDate == weeksDatesElement.endDate) {
                                weeksDatesElement.startDate = subtractDay(weeksDatesElement.endDate)
                            }
                            lastWeek = true
                        }
                        let obj = {
                            subscriptionId: tokenElement.subscriptionId,
                            usagePointId: tokenElement.usagePointId,
                            meterReadingId: tokenElement.meterReadingId,
                            startDate: weeksDatesElement.startDate,
                            endDate: weeksDatesElement.endDate,
                            tokenId: tokenElement.id
                        }

                        let array = await intervalBlock(headers, obj)
                        array = comparerArray(MeterReadingTillDate, array)

                        MeterReadingTillDate = MeterReadingTillDate.concat(array)
                        if (lastWeek) {
                            break
                        }
                    }
                    console.log(MeterReadingTillDate)
                    createLogItem(true, 'MeterReadingTillDate', "MeterReadingTillDate", JSON.stringify(MeterReadingTillDate))

                    let data = await db.MeterReading.bulkCreate(MeterReadingTillDate);
                    console.log("Data 111 >>> ", data)
                }

            } catch (error) {
                createLogItem(true, 'CRON ERROR', "CRON ERROR", error)
                console.log('intervalBlock Error ', error)
            }
        }
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

module.exports = {
    meterReading
}