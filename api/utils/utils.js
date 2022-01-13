exports.findNestedObj = (entireObj, keyToFind) => {
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
		var _s = parseInt(week.start, 10) + 1,
			_e = parseInt(week.end, 10) + 1,
			startDate = new Date(year, month, _s).toJSON().slice(0, 10).split('-').reverse().join('/'),
			endDate = new Date(year, month, _e).toJSON().slice(0, 10).split('-').reverse().join('/');
		return { startDate: moment(startDate, 'DD/MM/YYYY').format('YYYY-MM-DD'), endDate: moment(endDate, 'DD/MM/YYYY').format('YYYY-MM-DD') }
	});

	return weeks;
}
// console.table(getWeeksStartAndEndInMonth(1, 2020, 'monday'));

module.exports = {
	getWeeksStartAndEndInMonth
}
