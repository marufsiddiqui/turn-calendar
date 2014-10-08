/**
 * @ngdoc directive
 * @name calendar
 * @restrict AE
 *
 * @description
 * An AngularJS directive that allows a calendar to be display when embedded.
 *
 * Allow the following options :
 *
 * @param {number} startingMonth - The starting month of the calendar, if not
 * specify will use the current month. January is count as 0, February is 1,
 * and so on.
 *
 * @param {number} startingYear - The starting year of the calendar, if not
 * specify will use the current year
 *
 * @param {number} backwardMonths - The number of calendar instances of previous
 * months count from the current instance, notice the s. For example, if the
 * current month is September, and you want to display July and August in your
 * calendar pop up, set backwardMonths=2. Maximum allowed value is 6. Minimum
 * allowed is 1.
 *
 * @param {number} forwardMonths - The number of calendar instances of next
 * months count from the current instance, notice the s at the end. For example:
 * current month is September, and you want to display October and November, set
 * forwardMonths=2. Maximum allowed value is 6. Minimum allowed is 1.
 *
 * @param {boolean} useMonday - The week start on Monday instead of Sunday like
 * regular calendar
 *
 * @param {string} minSelectDate - The minimum date which any dates which are
 * earlier than that date will not be able to be selected, accept a string in
 * MM-DD-YYYY or MM/DD/YYYY format
 *
 * @param {string} maxSelectDate - The maximum date which any dates which are
 * later than that date will not be able to be selected, accept a string in
 * MM-DD-YYYY or MM/DD/YYYY format
 *
 * @param {number} weeklySelectRange - A number in which if the hovered/selected
 * SECOND date is beyond the FIRST selected date, the mouse pointer will change
 * to WEEKLY hover/selected mode
 *
 * @param {number} monthlySelectRange - A number in which if the hovered/selected
 * SECOND date is beyond the FIRST selected date, the mouse pointer will change
 * to MONTHLY hover/selected mode
 *
 * @example
 *
 * <calendar use-monday="true" starting-month="7" starting-year="2013" forward-months="2" backward-months="2">
 * </calendar>
 *
 * The above code snippet will display 5 months instance, starting from June 2013
 * to Oct 2013, with Monday as the starting day of the week
 *
 * @author Tri Pham <tri.pham@turn.com>
 */
angular
    .module('calendar', ['calendarTemplates'])
    .controller('CalendarController', ['$scope', function ($scope) {

        /**
         * Month name to display on calendar
         *
         * @type {array}
         */
        const MONTH_NAME = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        /**
         * Constraint on maximum months allowed to display, either as forward
         * or backward
         *
         * @type {number}
         */
        const MAX_MONTH_ALLOWED = 6;

        /**
         * Constraint on minimum months allowed to display as extra forward or
         * backward
         *
         * @type {number}
         */
        const MIN_MONTH_ALLOWED = 1;

        /**
         * Maximum number of day to display on a calendar in month view
         *
         * @type {number}
         */
        const MAX_DAY = 42;


        const DAY_IN_WEEK = 7;

        /**
         * An array which will contains the month name with year to display on
         * the template
         *
         * @type {array}
         */
        $scope.monthNames = [];

        /**
         * An array which contains the name of day of week, to be displayed
         * by template
         *
         * @type {array}
         */
        $scope.dayNames = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

        if ($scope.useMonday) {
            $scope.dayNames.push('Su');
        } else {
            $scope.dayNames.unshift('Su');
        }

        /**
         * Determine the starting month for base month, if not specify from input
         * it will use the current month
         *
         * @returns {number} - Starting month of the base month of calendar
         */
        var setBaseMonth = function () {

            var month, currentDate = new Date();

            if ($scope.startingMonth && $scope.startingMonth >= 0) {
                month = $scope.startingMonth;
            } else {
                month = currentDate.getMonth();
            }

            return month;
        };

        /**
         * Determine the starting year of base month, if not specify will use
         * the current year
         *
         * @returns {number} - The starting year of base month of calendar
         */
        var setBaseYear = function () {

            var year, currentDate = new Date();

            if ($scope.startingYear) {
                year = $scope.startingYear;
            } else {
                year = currentDate.getFullYear();
            }

            return year;
        };

        var isMonthValid = function (month) {
            return month && month >= MIN_MONTH_ALLOWED && month <= MAX_MONTH_ALLOWED;
        };

        var setForwardMonths = function (monthArray, month, year) {

            if (!isMonthValid($scope.forwardMonths)) {
                return;
            }

            var yearReset = false;

            for (var i = 1; i <= $scope.forwardMonths; i++) {

                var newMonth = month + i;

                // Bigger than 11 means moving to next year
                if (newMonth > 11) {
                    newMonth = newMonth % 12;

                    if (!yearReset) {
                        year = year + 1;
                        yearReset = true;
                    }
                }

                monthArray.push(generateDayArray(year, newMonth));
                $scope.monthNames.push(MONTH_NAME[newMonth] + ' ' + year);

            }

        };

        var setBackwardMonths = function (monthArray, month, year) {

            if (!isMonthValid($scope.backwardMonths)) {
                return;
            }

            var yearReset = false, newMonthCount = 0;

            for (var i = 1; i <= $scope.backwardMonths; i++) {

                var newMonth = month - i;

                // The year has been reset, use newMonthCount, not i
                if (yearReset) {
                    newMonth = month - newMonthCount;
                    newMonthCount++;
                }

                // Lower than 0 means moving backward to previous year
                if (newMonth < 0) {
                    month = newMonth = 11;
                    year = year - 1;
                    yearReset = true;
                    newMonthCount++;
                }

                monthArray.unshift(generateDayArray(year, newMonth));
                $scope.monthNames.unshift(MONTH_NAME[newMonth] + ' ' + year);
            }

        };

        /**
         * Function to generate an array that contains several months per specify
         * by the config from user
         *
         * @returns {array} The array that contains
         */
        var generateMonthArray = function () {
            var year = setBaseYear(),
                month = setBaseMonth(),
                baseMonth = generateDayArray(year, month),
                monthArray = [];

            monthArray.push(baseMonth);
            $scope.monthNames.push(MONTH_NAME[month] + ' ' + year);

            setForwardMonths(monthArray, month, year);

            setBackwardMonths(monthArray, month, year);

            return monthArray;

        };

        /**
         * Function to determine the first day of the 42 day to be shown on a
         * month view calendar.
         *
         * @param {number} year - The year in question
         * @param {number} month - The month in question
         * @returns {object} Javascript date object of the first date to be shown
         */
        var getFirstDate = function (year, month) {

            var firstDayOfMonth = new Date(year, month, 1),
                dayOfWeek = firstDayOfMonth.getDay(),
                firstDate;

            if ($scope.useMonday) {
                firstDate = new Date(firstDayOfMonth.setDate(2 - dayOfWeek));
            } else {
                firstDate = new Date(firstDayOfMonth.setDate(1 - dayOfWeek))
            }

            return firstDate;

        };

        /**
         * An utility function to split a big array into small chunks of a fixed
         * size.
         *
         * @param {array} array - The array to be split
         * @param {number} size - The fix size to be split into
         * @returns {array} An array of fixed size array
         */
        var arraySplit = function (array, size) {
            var arrays = [];
            while (array.length > 0) {
                arrays.push(array.splice(0, size));
            }
            return arrays;
        };

        /**
         * Function to generate the full 42 day to be shown on the calendar
         *
         * @param {number} year - The year to be shown
         * @param {number} month - The month to be shown
         * @returns {array} A 2 dimension array contains the weeks to be shown
         */
        var generateDayArray = function (year, month) {
            var currentDate = new Date(getFirstDate(year, month)),
                dayArray = [];

            for (var i = 0; i < MAX_DAY; i++) {
                dayArray.push(generateMetaDateObject(new Date(currentDate), month));
                currentDate.setDate(currentDate.getDate() + 1);
            }

            return arraySplit(dayArray, DAY_IN_WEEK);
        };

        $scope.currentSelectedStartDate = { date : new Date()};
        $scope.currentSelectedEndDate = new Date().toLocaleDateString();

        $scope.selectedStartDate = null;
        $scope.selectedEndDate = null;


        var isUnavailable = function (date) {
            return date <= new Date($scope.minSelectDate)
                   || date >= new Date($scope.maxSelectDate);
        };


        /**
         * Function that determine if the current day is within the selected
         * range, either weekly select range or monthly select range
         *
         * @param {number} selectRange - The range to determine whether the
         * day is falling within
         * @param {number} compareRange - An optional second range, to determine
         * if the day is sandwiched between two range or not
         * @param {object} day - The day in question
         * @returns {boolean} True if exceeds or is between the two range, false
         * if not
         */
        var isSelectRange = function (selectRange, compareRange, day) {

            if (!selectRange) {
                return false;
            }

            var tempDate1 = new Date($scope.selectedStartDate.date.toLocaleDateString()),
                tempDate2 = new Date($scope.selectedStartDate.date.toLocaleDateString()),
                tempDate3 = new Date($scope.selectedStartDate.date.toLocaleDateString()),
                tempDate4 = new Date($scope.selectedStartDate.date.toLocaleDateString()),
                tempDateForward = tempDate1.setDate(tempDate1.getDate() + selectRange),
                tempDateBackward = tempDate2.setDate(tempDate2.getDate() - selectRange),
                compareRangeForward, compareRangeBackward;

            if (compareRange) {
                compareRangeForward = tempDate3.setDate(tempDate3.getDate() + compareRange);
                compareRangeBackward = tempDate4.setDate(tempDate4.getDate() - compareRange);

                if (compareRange > selectRange) {
                    return !day.isUnavailable &&
                            ((day.date > tempDateForward && day.date < compareRangeForward) ||
                            (day.date > compareRangeBackward && day.date < tempDateBackward));
                }
            }

            return !day.isUnavailable && (day.date > tempDateForward || day.date < tempDateBackward);
        };

        var setWeekValue = function (week, isHover, hoverValue, selectMode) {
            week.forEach(function (day) {

                if (!day.date || day.isUnavailable) {
                    return;
                }

                if (isHover) {
                    day.isHover = hoverValue;
                    return;
                }

                day.selectMode = selectMode;
            });
        };

        var setMonthValue = function (month, isHover, hoverValue, selectMode) {
            month.forEach(function (week) {
                setWeekValue(week, isHover, hoverValue, selectMode);
            });
        };

        /**
         * Set the hover value or selected value of the day in question through
         * the month that contains the day in question
         *
         * @param {object} selectedDay - The day in question
         * @param {boolean} isHover - Whether this is a hover or selection
         * @param {boolean} hoverValue - True if hovered, false if not
         * @param {string} selectMode - The current select mode
         */
        var paletteTheMonth = function (selectedDay, isHover, hoverValue, selectMode) {

            var monthFound = false;

            for (var i = 0; i < $scope.monthArray.length; i++) {

                var month = $scope.monthArray[i];

                for (var j = 0; j < month.length; j++) {

                    var week = month[j];

                    for (var k = 0; k < week.length; k++) {
                        if (week[k] && week[k].date && week[k].date == selectedDay.date) {
                            monthFound = true;
                            break;
                        }
                    }

                    if (monthFound) {
                        break;
                    }
                }

                if (monthFound) {
                    setMonthValue(month, isHover, hoverValue, selectMode);
                    break;
                }
            }
        };

        /**
         * Set the hover value or selected value of the day in question through
         * the week that contains the day
         *
         * @param {object} selectedDay - The day in question
         * @param {boolean} isHover - Whether this is a hover or selection
         * @param {boolean} hoverValue - True if hovered, false if not
         * @param {string} selectMode - The current select mode
         */
        var paletteTheWeek = function (selectedDay, isHover, hoverValue, selectMode) {

            var weekFound = false;

            for (var i = 0; i < $scope.monthArray.length; i++) {

                var month = $scope.monthArray[i];

                for (var j = 0; j < month.length; j++) {

                    var week = month[j];

                    for (var k = 0; k < week.length; k++) {
                        if (week[k] && week[k].date && week[k].date == selectedDay.date) {
                            weekFound = true;
                            break;
                        }
                    }

                    if (weekFound) {
                        setWeekValue(week, isHover, hoverValue, selectMode);
                        break;
                    }
                }

                if (weekFound) {
                    break;
                }
            }
        };


        /**
         * Function to determine whether to hover the cell or not
         *
         * @param {object} day - The day in question
         */
        $scope.mouseEnter = function (day) {

            if (!day.date) {
                day.isHover = false;
                return;
            }

            if ($scope.selectedStartDate && $scope.selectedEndDate) {
                day.isHover = false;
                return;
            }

            if (!$scope.selectedStartDate) {
                day.isHover = true;
                return;
            }

            if (isSelectRange($scope.weeklySelectRange, $scope.monthlySelectRange, day)) {
                paletteTheWeek(day, true, true, '');
                return;
            }

            if (isSelectRange($scope.monthlySelectRange, $scope.weeklySelectRange, day)) {
                paletteTheMonth(day, true, true, '');
                return;
            }

            if (!day.isUnavailable) {
                day.isHover = true;
            }

        };

        /**
         * Function to determine if to remove the hover of the current day
         *
         * @param {object} day - The day in question
         */
        $scope.mouseLeave = function (day) {

            if (!$scope.selectedStartDate) {
                day.isHover = false;
                return;
            }

            if (isSelectRange($scope.weeklySelectRange,  $scope.monthlySelectRange, day)) {
                paletteTheWeek(day, true, false, '');
                return;
            }

            if (isSelectRange($scope.monthlySelectRange,  $scope.weeklySelectRange, day)) {
                paletteTheMonth(day, true, false, '');
                return;
            }

            day.isHover = false;
        };

        var generateMetaDateObject = function (date, currentMonth) {

            if (date.getMonth() !== currentMonth) {
                return {};
            }

            return {
                date: date,
                selectMode: '',
                isHover: false,
                isUnavailable: isUnavailable(date)
            };
        };

        var isDaily = function () {
            return (!$scope.weeklySelectRange && !$scope.monthlySelectRange) ||
                   (!isSelectRange($scope.weeklySelectRange, $scope.monthlySelectRange, $scope.selectedEndDate) &&
                    !isSelectRange($scope.weeklySelectRange, $scope.monthlySelectRange, $scope.selectedEndDate));
        };

        /**
         * Go through all the dates to turn on the selected class if the date
         * fall in between selected start date and selected end date
         */
        var colorSelectedDateRange = function () {

            $scope.monthArray.forEach(function (month) {

                month.forEach(function (week) {

                    week.forEach(function (day) {

                        if (day && day.date && day.date <= $scope.selectedEndDate.date && day.date >= $scope.selectedStartDate.date) {

                            if (isDaily()) {
                                day.selectMode = 'daily';
                            }

                            if (isSelectRange($scope.weeklySelectRange, $scope.monthlySelectRange, $scope.selectedEndDate)) {
                                day.selectMode = 'weekly';
                            }

                            if (isSelectRange($scope.monthlySelectRange, $scope.weeklySelectRange, $scope.selectedEndDate)) {
                                day.selectMode = 'monthly';
                            }

                        }
                    });

                });
            });


            if (isSelectRange($scope.weeklySelectRange, $scope.monthlySelectRange, $scope.selectedEndDate)) {
                paletteTheWeek($scope.selectedStartDate, false, false, 'weekly');
                paletteTheWeek($scope.selectedEndDate, false, false, 'weekly');
            }

            if (isSelectRange($scope.monthlySelectRange, $scope.weeklySelectRange, $scope.selectedEndDate)) {
                paletteTheMonth($scope.selectedStartDate, false, false, 'monthly');
                paletteTheMonth($scope.selectedEndDate, false, false, 'monthly');
            }
        };

        /**
         * Remove all selected dates
         */
        var discolorSelectedDateRange = function () {
            $scope.monthArray.forEach(function (month) {
                month.forEach(function (week) {
                    week.forEach(function (day) {
                        if (day && day.selectMode) {
                            day.selectMode = '';
                            day.isHover = false;
                        }
                    });
                });
            });
        };

        var resetCalendar = function (day) {

            $scope.selectedEndDate = null;
            discolorSelectedDateRange();
            $scope.selectedStartDate = day;
            day.selectMode = 'daily';

        };

        var isBothSelected = function () {
            return $scope.selectedStartDate && $scope.selectedEndDate;
        };

        var isNoneSelected = function () {
            return !$scope.selectedStartDate && !$scope.selectedEndDate;
        };

        var isStartDateSelected = function () {
            return $scope.selectedStartDate && !$scope.selectedEndDate;
        };

        var setEndDate = function (day) {

            if (day.date < $scope.selectedStartDate.date) {
                $scope.selectedEndDate = $scope.selectedStartDate;
                $scope.selectedStartDate = day;
            } else if (day.date > $scope.selectedStartDate.date) {
                $scope.selectedEndDate = day;
            }

            colorSelectedDateRange();

        };

        var setStartDate = function (day) {

            $scope.selectedStartDate = day;
            day.selectMode = 'daily';

        };

        $scope.setDayClick = function (day) {

            if (day.isUnavailable) {
                return;
            }

            if (isNoneSelected()) {

                setStartDate(day);

            } else if (isStartDateSelected()) {

                setEndDate(day);

            } else if (isBothSelected()) {

                resetCalendar(day);

            }

        };

        $scope.monthArray = generateMonthArray();

        // Allow to show the calendar or hide it
        $scope.calendarEnabled = false;

        /**
         * Function to show the calendar or hide it
         */
        $scope.enableCalendar = function () {
            $scope.calendarEnabled = !$scope.calendarEnabled;
        };

        $scope.apply = function () {
            $scope.currentSelectedStartDate = $scope.selectedStartDate;
            $scope.currentSelectedEndDate = $scope.selectedEndDate;
            $scope.calendarEnabled = false;
        };

        $scope.cancel = function () {
            discolorSelectedDateRange();
            $scope.selectedStartDate = $scope.currentSelectedStartDate;
            $scope.selectedEndDate = $scope.currentSelectedEndDate;
            colorSelectedDateRange();
            $scope.calendarEnabled = false;
        };

        /**
         * Function that add a new
         */
        $scope.nextMonth = function () {

            var lastMonth = $scope.monthArray[$scope.monthArray.length - 1],
                middleWeek = lastMonth[2],
                middleDateOfMonth = middleWeek[6],
                year = middleDateOfMonth.date.getFullYear(),
                month = middleDateOfMonth.date.getMonth(),
                newMonth = month + 1;

            // Bigger than 11 means moving to next year
            if (newMonth > 11) {
                newMonth = newMonth % 12;
                year = year + 1;
            }

            var newMonthArray = generateDayArray(year, newMonth);

            $scope.monthArray.shift();
            $scope.monthArray.push(newMonthArray);

            $scope.monthNames.shift();
            $scope.monthNames.push(MONTH_NAME[newMonth] + ' ' + year);
            discolorSelectedDateRange();
            colorSelectedDateRange();

        };

        /**
         * Function that add a new month to the month array. The month is the
         * previous month of the lowest month in the array.
         */
        $scope.previousMonth = function () {

            var firstMonth = $scope.monthArray[0],
                middleWeek = firstMonth[2],
                middleDateOfMonth = middleWeek[6],
                year = middleDateOfMonth.date.getFullYear(),
                month = middleDateOfMonth.date.getMonth(),
                newMonth = month - 1;

            // Lower than 0 means moving backward to previous year
            if (newMonth < 0) {
                newMonth = 11;
                year = year - 1;
            }

            var newMonthArray = generateDayArray(year, newMonth);

            $scope.monthArray.pop();
            $scope.monthArray.unshift(newMonthArray);

            $scope.monthNames.pop();
            $scope.monthNames.unshift(MONTH_NAME[newMonth] + ' ' + year);

            discolorSelectedDateRange();
            colorSelectedDateRange();
        };


    }])
    .directive('calendar', function () {

        return {
            restrict: 'AE',
            scope: {
                startingMonth: '=',
                startingYear: '=',
                backwardMonths: '=',
                forwardMonths: '=',
                useMonday: '=',
                weeklySelectRange: '=',
                monthlySelectRange: '=',
                minSelectDate: '=',
                maxSelectDate: '=',
                priorRange: '='
            },
            controller: 'CalendarController',
            templateUrl: 'calendar.html'
        };

    });