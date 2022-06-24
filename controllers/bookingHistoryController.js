const Booking = require('../Models/Booking');
const User = require('../Models/User');

module.exports.getBookingHistory = async (req, res) => {
    const { _id: userId } = req.user;
    try {
        let bookings1 = await Booking.find({ user: userId, jobStatus: "CANCELLED" }).sort({ createdAt: -1 });
        let bookings2 = await Booking.find({ user: userId, bookingProgress: "delivered" }).sort({ createdAt: -1 });
        let bookings = bookings1.concat(bookings2);

        bookings = bookings.sort((a, b) => {
            let da = new Date(a.bookingDate);
            let db = new Date(b.bookingDate);

            return db - da;
        })
        console.log(bookings);
        res.render("booking_history", {
            title: "Booking History",
            bookings,
        })
    } catch (err) {
        console.log(err);
        res.render('error_page', {
            title: "Server Error!",
            url: "/dashboard",
        })
    }
}

module.exports.filterByDate = async (req, res) => {
    let { from, to, ref } = req.query;
    console.log(from, to, ref);
    try {
        let bookings;
        if (ref !== undefined) {
            ref = ref.replace(/;/g, ' ');
            bookings = await Booking.find({
                user: req.user._id,
                "deliveryDetails.jobReference": ref,
                bookingProgress: { $in: "completed" },
            }).sort({ bookingDate: -1 });
        }

        if (from !== undefined && to !== undefined) {
            bookings = await Booking.find({
                user: req.user._id,
                bookingDate: {
                    $gte: from,
                    $lte: to,
                },
                bookingProgress: { $in: ["completed", "delivered"] },
            }).sort({ bookingDate: -1 });
        }
        console.log(bookings);
        res.render("booking_history", {
            title: "Booking History",
            bookings,
        });
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/history",
        })
    }
}