const moment = require("moment-timezone");

module.exports.checkAvailability = async (booking) => {
    const serviceTimings = {
        flatRate: '10:00',
        standard: '14:00',
        vip: '15:30',
        express: '17:00',
    }
    try {
        const timeNow = moment(new Date()).tz("Australia/Sydney").format("HH:mm");
        const dateToday = moment(new Date()).tz("Australia/Sydney").format("YYYY-MM-DD");
        const bookingDate = booking.deliveryPriority.pickupDateTime.split("T")[0];
        const bookingTime = booking.deliveryPriority.pickupDateTime.split("T")[1];
        console.log("Availability");
        console.log(dateToday);
        if (moment(bookingDate).isBefore(dateToday)) {
            console.log("returning from here");
            return false;
        }

        if (booking.deliveryPriority.serviceType === "paxi") {
            return true;
        }

        if (moment(bookingDate).isSame(dateToday)) {
            // if (moment(bookingTime, 'HH:mm').isBefore(timeNow, 'HH:mm') && moment(bookingTime, 'HH:mm').isSameOrBefore(serviceTimings[booking.deliveryPriority.serviceType], 'HH:mm')) {
            //     return true;
            // }
            var regex = new RegExp(':', 'g'),
                timeStr1 = bookingTime,
                timeStr2 = timeNow,
                timeStr3 = serviceTimings[booking.deliveryPriority.serviceType];


            if ((parseInt(timeStr1.replace(regex, ''), 10) <= parseInt(timeStr3.replace(regex, ''), 10))) {
                console.log('service is available');
                return true;
            }
        }

        if (moment(bookingDate).isAfter(dateToday)) {
            return true;
        }
        return false;
    } catch (err) {
        console.log('Error in fetching availability: ', err);
        return "err";
    }
}