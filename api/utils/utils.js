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
 * @returns array of objects with start and and date of weeks of given month
 */

const getWeeksStartAndEndInMonth = (month, year, _start) => {
	month = month - 1
	let monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
		d = new Date();
	// console.log("The current month is " + monthNames[d.getMonth()]);
	let weeks = [],
		firstDate = new Date(year, month, 1),
		lastDate = new Date(year, month + 1, 0),
		numDays = lastDate.getDate();
	var c = Date()
	let start = 1;
	let end = 2 - firstDate.getDay();
	if (_start == 'monday') {
		if (firstDate.getDay() === 0) {
			end = 1;
		} else {
			end = 2 - firstDate.getDay() + 1;
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
		end = end + 2;
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

		if (startDate == endDate) {
			startDate = subtractDay(endDate)
		}

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
	// console.log(timeValues)
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

const subtractDay = (date) => {
	date = moment(date);
	date = date.subtract(1, "days").format("YYYY-MM-DD");
	return date
}

const weekDatesArrayTillToday = (d, year) => {
	let weeksArray = []

	for (let a = 0; a < year.length; a++) {
		const yearElement = year[a];
		let months
		if (yearElement === moment().year())
			months = getMonthsBeforeGivenDate(d);
		else
			months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
		let weeks = []
		// get every weeks start date and end date of month
		for (let i = 0; i < months.length; i++) {
			const element = months[i];
			let array = getWeeksStartAndEndInMonth(element, yearElement, "monday");
			weeks = weeks.concat(array)
		}
		let weeksDatesTillTodaysWeek = []
		for (let i = 0; i < weeks.length; i++) {
			let weeksDatesElement = weeks[i];
			// change end date of week if current date fall between given week
			if (checkIfDateIsBetweenTwoDates(moment(d).format('YYYY-MM-DD'), weeksDatesElement)) {
				weeksDatesElement = { startDate: weeksDatesElement.startDate, endDate: moment(d).format('YYYY-MM-DD') }
				if (weeksDatesElement.startDate == weeksDatesElement.endDate) {
					weeksDatesElement.startDate = subtractDay(weeksDatesElement.endDate)
				}
				weeksDatesTillTodaysWeek.push(weeksDatesElement)
				break
			} else {
				if (weeksDatesElement.startDate == weeksDatesElement.endDate) {
					weeksDatesElement.startDate = subtractDay(weeksDatesElement.endDate)
				}
				weeksDatesTillTodaysWeek.push(weeksDatesElement)
			}
		}
		weeksArray = weeksArray.concat(weeksDatesTillTodaysWeek)
	}
	return weeksArray
}

const splitArrayIntoChunksOfLen = (arr, len) => {
	var chunks = [], i = 0, n = arr.length;
	while (i < n) {
		chunks.push(arr.slice(i, i += len));
	}
	return chunks;
}


/**
 * 
 * @param {*} array1 
 * @param {*} array2 
 * @returns object from array2 which is only present in array2 
 */
const comparerArray = (array1, array2) => {
	function comparer(otherArray) {
		return function (current) {
			return otherArray.filter(function (other) {
				return other.date == current.date
			}).length == 0;
		}
	}

	var onlyInArray2 = array2.filter(comparer(array1));
	return onlyInArray2
}

module.exports = {
	findNestedObj,
	getWeeksStartAndEndInMonth,
	splitArrayIntoChunksOfLen,
	getMonthsBeforeGivenDate,
	checkIfDateIsBetweenTwoDates,
	weekDatesArrayTillToday,
	subtractDay,
	comparerArray
}
