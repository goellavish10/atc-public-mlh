const schedule = require("node-schedule");
const Booking = require('../Models/Booking');

const deleteQuoteJobs = async () => {
    schedule.scheduleJob('0 0 * * 0', async () => {
        const quoteBookings = await Booking.deleteMany({ quoteUserSessionId: { $exists: true, $nin: [null] } });
    })
}

module.exports = { deleteQuoteJobs };
