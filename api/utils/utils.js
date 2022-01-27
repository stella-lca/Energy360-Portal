const moment = require("moment");

const findNestedObj = (entireObj, keyToFind) => {
	let foundObj;
	JSON.stringify(entireObj, (_, nestedValue) => {
		if (nestedValue && nestedValue[keyToFind]) {
			foundObj = nestedValue[keyToFind];
		}
		return nestedValue;
	});
	return foundObj;
};

/**
 * 
 * @param {*} month number
 * @param {*} year number
 * @param {*} _start monday
 * @returns 
 */

const getWeeksStartAndEndInMonth = (month, year, _start) => {
	month = month - 1
	let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		d = new Date();
	console.log("The current month is " + monthNames[d.getMonth()]);
	let weeks = [],
		firstDate = new Date(year, month, 1),
		lastDate = new Date(year, month + 1, 0),
		numDays = lastDate.getDate();
	var c = Date()
	let start = 1;
	let end = 7 - firstDate.getDay();
	if (_start == 'monday') {
		if (firstDate.getDay() === 0) {
			end = 1;
		} else {
			end = 7 - firstDate.getDay() + 1;
		}
	}
	while (start <= numDays) {
		// change end-2 for BusinessWeekends
		var businessWeekEnd = end
		if (businessWeekEnd > 0) {
			if (businessWeekEnd > start) {
				weeks.push({ start: start, end: businessWeekEnd });
			}
			else {
				//Check for last day else end date is within 5 days of the week.
				weeks.push({ start: start, end: end });
			}
		}
		start = end + 1;
		end = end + 7;
		end = start === 1 && end === 8 ? 1 : end;
		if (end > numDays) {
			end = numDays;
		}
	}

	weeks = weeks.map(week => {
		var _s = parseInt(week.start, 10),
            _e = parseInt(week.end, 10),
            startDate = moment().year(year).month(month).date(_s).format('YYYY-MM-DD'),
            endDate = moment().year(year).month(month).date(_e).format('YYYY-MM-DD');

        return { startDate: startDate, endDate: endDate }
	});

	return weeks;
}
// console.table(getWeeksStartAndEndInMonth(1, 2020, 'monday'));

/** 
 * @param {*} date
 * @returns Returns the months passed before given date for current year 
 */
const getMonthsBeforeGivenDate = (date) => {
	var dateStart = moment().startOf('year'),
		dateEnd = moment(new Date(date)),
		timeValues = [];

	while (dateEnd > dateStart || dateStart.format('M') === dateEnd.format('M')) {
		timeValues.push(dateStart.format('M'));
		dateStart.add(1, 'month');
	}
	console.log(timeValues)
	return timeValues
}

/**
 * 
 * @param {*} currentDate new Date() 
 * @param {*} datesObj type {startDate: "YYYY-MM-DD", endDate: "YYYY-MM-DD" }
 * @returns Boolean
 */

const checkIfDateIsBetweenTwoDates = (currentDate, datesObj) => {
	var date = moment(currentDate, 'YYYY-MM-DD');
	var startDate = moment(datesObj.startDate, "YYYY-MM-DD");
	var endDate = moment(datesObj.endDate, "YYYY-MM-DD");

	if (!(date.isBefore(startDate) || date.isAfter(endDate))) {
		return true
	} else {
		return false
	}
}

module.exports = {
	findNestedObj,
	getWeeksStartAndEndInMonth,
	getMonthsBeforeGivenDate,
	checkIfDateIsBetweenTwoDates
}
