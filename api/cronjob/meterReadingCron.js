const cron = require('node-cron');
var db = require('../models')
const { generateThirdPartyToken, intervalBlock } = require('../utils/api')
const { createLogItem } = require('../utils/errorTacker');
const moment = require('moment');
const { subtractDay, comparerArray, weekDatesArrayTillToday } = require('../utils/utils');
const { sequelize } = require('../models');
var Op = require('sequelize').Op;
require('dotenv').config()

const { APPSETTING_SUBSCRIPTION_KEY } = process.env

const meterReading = () => {
    // 45 23 * * *
    // */30 * * * *
    cron.schedule('*/30 * * * *', async () => {
        console.log('running a task every two minutes  ');
        let Token = await db.Token.findAll({ include: { model: db.IntervalBlockPayload } }),
            readingEndDate = moment().format('YYYY-MM-DD'),
            d = new Date(),
            year = moment().year(),
            lastYear = moment().subtract(1, "years").format('YYYY')
        let yearArray = [lastYear, year]
        for (let i = 0; i < Token.length; i++) {
            let tokenElement = Token[i];
            for (let index = 0; index < tokenElement.GCEP_IntervalBlockPayloads.length; index++) {

                let intervalBlockElement = tokenElement.GCEP_IntervalBlockPayloads[index].dataValues
                let meterReadingId = intervalBlockElement.meterReadingId;
                let usagePointId = intervalBlockElement.usagePointId;
                let intervalBlockPayloadId = intervalBlockElement.id;

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
                            intervalBlockPayloadId: intervalBlockPayloadId,
                            date: { [Op.gt]: firstDayOfYear }
                        }
                    })

                    if (meterReading.length > 0) {

                        let readingStartDate = subtractDay(readingEndDate)

                        let obj = {
                            subscriptionId: tokenElement.subscriptionId,
                            usagePointId: usagePointId,
                            meterReadingId: meterReadingId,
                            startDate: readingStartDate,
                            endDate: readingEndDate,
                            intervalBlockPayloadId: intervalBlockPayloadId
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
                            if (intervalBlockToday.length > 0) {
                                let data = await db.MeterReading.bulkCreate(intervalBlockToday);
                                createLogItem(true, 'intervalBlockToday', "intervalBlockToday Added", JSON.stringify(data))
                            }
                        }
                    } else {
                        let weeksDates = weekDatesArrayTillToday(d, yearArray),
                            MeterReadingTillDate = []

                        for (let i = 0; i < weeksDates.length; i++) {
                            let weeksDatesElement = weeksDates[i];
                            try {

                                let obj = {
                                    subscriptionId: tokenElement.subscriptionId,
                                    usagePointId: usagePointId,
                                    meterReadingId: meterReadingId,
                                    startDate: weeksDatesElement.startDate,
                                    endDate: weeksDatesElement.endDate,
                                    intervalBlockPayloadId: intervalBlockPayloadId

                                }

                                let array = await intervalBlock(headers, obj)
                                if (array.error) {
                                    if (array.error.payload) {
                                        let payload = {
                                            errorMessage: array.error?.error?.message, intervalBlockPayloadId: array.error.payload.intervalBlockPayloadId, minDate: array.error.payload.startDate, maxDate: array.error.payload.endDate
                                        }
                                        await db.MeterCronError.create(payload)
                                    }
                                }
                                array = comparerArray(MeterReadingTillDate, array)     // compare and return unique object from second array 
                                await db.MeterReading.bulkCreate(array);

                                MeterReadingTillDate = MeterReadingTillDate.concat(array)
                            } catch (error) {
                                createLogItem(true, `CRON ERROR payloadId ${intervalBlockPayloadId} startDate ${weeksDatesElement.startDate} <-> endDate${weeksDatesElement.endDate}`, "error in cron", error)
                                console.log('Cron Error ', error)
                                if (error.payload) {
                                    let payload = {
                                        errorMessage: error?.error?.message, intervalBlockPayloadId: error.payload.intervalBlockPayloadId, minDate: error.payload.startDate, maxDate: error.payload.endDate
                                    }
                                    console.log('Cron payload ', payload)
                                    await db.MeterCronError.create(payload)
                                }
                            }


                        }
                        console.log(MeterReadingTillDate)
                        createLogItem(true, 'MeterReadingTillDate', "MeterReadingTillDate", JSON.stringify(MeterReadingTillDate))
                        console.log("MeterReading BulkCreate >>> ", MeterReadingTillDate)
                    }

                } catch (error) {
                    createLogItem(true, 'CRON ERROR', "error in cron", error)
                    console.log('Cron Error ', error)
                }
            }
        }
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}

const meterErrorDataInput = async () => {
    // 45 23 * * *
    // */30 * * * *
    cron.schedule('*/30 * * * *', async () => {
        let tokens = await db.Token.findAll({
            include: {
                model: db.IntervalBlockPayload,
                include: {
                    model: db.MeterCronError,
                    where: { intervalBlockPayloadId: { [Op.ne]: null } }
                }
            }
        })

        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];

            for (let a = 0; a < token.GCEP_IntervalBlockPayloads.length; a++) {
                const intervalBlockPayloadElement = token.GCEP_IntervalBlockPayloads[a];

                for (let b = 0; b < intervalBlockPayloadElement.GCEP_MeterCronErrors.length; b++) {
                    let meterErrorElement = intervalBlockPayloadElement.GCEP_MeterCronErrors[b]
                    let meterReadingId = intervalBlockPayloadElement.meterReadingId;
                    let usagePointId = intervalBlockPayloadElement.usagePointId;
                    let intervalBlockPayloadId = intervalBlockPayloadElement.id;

                    try {
                        let AUTH_TOKEN = await generateThirdPartyToken(token.refresh_token, token.subscriptionId)

                        let headers = {
                            'content-type': 'application/json',
                            'ocp-apim-subscription-key': APPSETTING_SUBSCRIPTION_KEY,
                            'Authorization': 'Bearer ' + AUTH_TOKEN
                        },
                            firstDayOfYear = moment().startOf('year').format('YYYY-MM-DD');

                        let meterReading = await db.MeterReading.findAll({
                            where: {
                                intervalBlockPayloadId: intervalBlockPayloadId,
                                date: { [Op.gt]: firstDayOfYear }
                            }
                        })

                        if (meterReading.length > 0) {

                            let obj = {
                                subscriptionId: token.subscriptionId,
                                usagePointId: usagePointId,
                                meterReadingId: meterReadingId,
                                startDate: meterErrorElement.minDate,
                                endDate: meterErrorElement.maxDate,
                                intervalBlockPayloadId: intervalBlockPayloadId
                            }

                            let todayReading = meterReading.filter(e => e.date === meterErrorElement.maxDate)
                            let yesterdayReading = meterReading.filter(e => e.date === meterErrorElement.minDate)

                            let intervalBlockData = await intervalBlock(headers, obj)
                            if (todayReading && todayReading.length === 0 || yesterdayReading && yesterdayReading.length === 0) {
                                let intervalBlockToday
                                if (yesterdayReading.length > 0) {
                                    intervalBlockToday = intervalBlockData.filter(e => e.date == meterErrorElement.maxDate)
                                } else {
                                    intervalBlockToday = intervalBlockData.filter(e => e.date == meterErrorElement.maxDate || e.date == meterErrorElement.minDate)
                                }
                                if (intervalBlockToday.length > 0) {
                                    let data = await db.MeterReading.bulkCreate(intervalBlockToday);
                                    await db.MeterCronError.destroy({
                                        where: { intervalBlockPayloadId: intervalBlockPayloadId, maxDate: meterErrorElement.maxDate, minDate: meterErrorElement.minDate }
                                    })
                                    createLogItem(true, 'intervalBlockToday', "intervalBlockToday Added", JSON.stringify(data))
                                }
                            }
                        }
                    } catch (error) {
                        createLogItem(true, 'Error in error data input', "Error in error data input cron", JSON.stringify(error))
                        console.log('Cron Error ', error)
                    }
                }
            }
        }
    }, {
        scheduled: true,
        timezone: "America/New_York"
    });
}


module.exports = {
    meterReading,
    meterErrorDataInput
}