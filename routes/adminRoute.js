const express = require("express");
const stripe = require('stripe')(process.env.STRIPE_API);
const { adminAuthentication } = require("../middlewares/authorization");
const router = express.Router();
const Booking = require('../Models/Booking');
const Addresse = require('../Models/Address');

router.get("/all", adminAuthentication, async (req, res) => {
    try {
        const bookings = await Booking.find({ bookingProgress: { $in: ['completed', 'delivered'] } }).sort({ bookingDate: -1 });
        res.render("admin/index", {
            bookings,
        });
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/admin/all",
        })
    }
})


router.get("/cancel-booking", adminAuthentication, async (req, res) => {
    try {
        res.render("admin/refund");
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/admin/all",
        })
    }
})

router.post("/get-job", adminAuthentication, async (req, res) => {
    try {
        const { jobId, bookingDate } = req.body;
        const booking = await Booking.findOne({ jobId, bookingDate });

        res.json(booking);
    } catch (err) {
        console.log(err);
        res.json(err);
    }
})

router.post("/cancel-job", adminAuthentication, async (req, res) => {
    try {
        let booking = await Booking.findById(req.body.id);
        if (!booking) {
            return res.json({ msg: "No booking found for details provided." });
        }
        const refund = await stripe.refunds.create({
            payment_intent: booking.stripePaymentId,
        });
        console.log("------------REFUND INITIATED--------------- Job Id: " + booking.jobId);
        console.log(refund);

        booking = await Booking.findByIdAndDelete(req.body.id);

        res.json({ msg: 'ok' });
    } catch (err) {
        console.log(err);
        res.json({ msg: err.message });
    }
})

router.get("/suburb-add", adminAuthentication, async (req, res) => {
    try {
        res.render("admin/suburb_add", {
            query: ""
        });
    } catch (err) {
        console.log(err);
        res.render("../error_page", {
            title: "Admin Panel",
            url: "/admin/all",
        })
    }
})

router.post("/suburb-add", adminAuthentication, async (req, res) => {
    try {
        const { suburb, postcode } = req.body;
        let address = await Addresse.find({ SUBURB: suburb, PCODE: postcode });
        if (address.length !== 0) {
            return res.render("admin/suburb_add", {
                query: "exists",
            })
        }

        const addressObj = {
            SUBURB: suburb,
            PCODE: +postcode,
        }

        address = new Addresse(addressObj);
        address = await address.save();

        res.render("admin/suburb_add", {
            query: "added",
            suburb,
            postcode,
        })

    } catch (err) {
        console.log(err);
    }
})

router.get("/suburb-remove", adminAuthentication, async (req, res) => {
    try {
        res.render("admin/suburb_remove", {
            query: ""
        });
    } catch (err) {
        console.log(err);
        res.render("../error_page", {
            title: "Admin Panel",
            url: "/admin/all",
        })
    }
})

router.post("/suburb-search", adminAuthentication, async (req, res) => {
    try {
        const { postcode, suburb } = req.body;
        console.log(postcode, suburb);
        let address = await Addresse.find({ SUBURB: suburb, PCODE: +postcode });

        res.json(address);
    } catch (err) {
        console.log(err);
        res.render("../error_page", {
            title: "Admin Panel",
            url: "/admin/all",
        })
    }
})

router.post("/suburb-delete", adminAuthentication, async (req, res) => {
    try {
        const { id } = req.body;
        let address = await Addresse.findById(id);
        if (!address) {
            return res.json({ msg: "Doesn't exist in database" });
        }

        address = await Addresse.findByIdAndDelete(id);

        console.log(address);

        res.json({ msg: "ok" });

    } catch (err) {
        console.log(err);
    }
})

router.get("/suburb-edit/:id", adminAuthentication, async (req, res) => {
    try {
        const { id } = req.params;
        let address = await Addresse.findById(id);
        if (!address) {
            return res.json({ msg: "Doesn't exist in database" });
        }

        res.json(address);

    } catch (err) {
        console.log(err);
    }
})

router.put("/suburb-edit/:id", adminAuthentication, async (req, res) => {
    try {
        const { id } = req.params;
        const { suburb, postcode } = req.body;
        let address = await Addresse.findById(id);
        if (!address) {
            return res.json({ msg: "Doesn't exist in database" });
        }

        address = await Addresse.findByIdAndUpdate(id, {
            $set: {
                'SUBURB': suburb,
                'PCODE': postcode,
            }
        }, { new: true })

        res.json({ msg: 'ok' });
    } catch (err) {
        console.log(err);
    }
})
module.exports = router;