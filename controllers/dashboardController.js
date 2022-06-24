const User = require('../Models/User');
const Booking = require('../Models/Booking');
const { sendMail } = require('../utils/nodemailer');
const bcrypt = require('bcryptjs');
const crypto = require("crypto");
const stripe = require("stripe")(process.env.STRIPE_API);

module.exports.getDashboard = async (req, res) => {
    try {
        let bookings = await Booking.find({ user: req.user._id, bookingProgress: "completed", jobStatus: { $ne: "CANCELLED" } }).sort({ updatedAt: -1 });
        console.log(bookings);
        const user = await User.findById(req.user._id);
        if (bookings.length === 0) {
            res.render('dashboard', {
                title: `${req.user.name}'s Dashboard`,
                order: "none",
                name: req.user.name,
            })
            return;
        }
        res.render('dashboard', {
            title: `${req.user.name}'s Dashboard`,
            name: req.user.name,
            bookings,
            order: "order",
            // order: {
            //     pickupAddress: booking.pickupDetails.addressDetails.address,
            //     deliveryAddress: booking.deliveryDetails.addressDetails.address,
            //     name: booking.pickupDetails.name,
            //     bookedFor: booking.deliveryPriority.pickupDateTime,
            //     serviceLevel: booking.deliveryPriority.serviceType,
            //     service: booking[booking.deliveryPriority.serviceType]?.serviceCode,
            //     date: booking.createdAt.toString().split("T")[0],
            //     price: booking.cost,
            //     jobId: booking.jobId,
            //     reference: booking.deliveryDetails.jobReference,
            //     bookingDate: booking.bookingDate,
            //     jobStatus: booking.jobStatus
            // }
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/booking/step-1",
        })
    }

}

module.exports.getPasswordReset = (req, res) => {
    var string;
    crypto.randomBytes(128, function (err, buffer) {
        string = buffer.toString('hex');
        console.log(string);
        res.render('password_reset', {
            title: 'Password Reset',
            authCode: string,
        })
    })



}

module.exports.resetPassword = async (req, res) => {
    const { username } = req.body;
    const authCode = req.query.auth;
    console.log(username);
    try {
        const user = await User.findOneAndUpdate({ email: username }, {
            $set: {
                passResetAuthCode: authCode,
            }
        }, { new: true })
        let html = `
        <h1>Hello</h1>
        <p>You are recieving this email for password reset of account with email ${username}</p>
        <a href="https://atc-demo.herokuapp.com/password-reset/new-password?u=${user._id}&auth=${authCode}">Click here to verify</a>
    `;

        if (!user) {
            return res.redirect('/email?q=reset')
        }
        const emailObj = {
            full_name: user.name,
            email: user.email,
            html,
        }
        sendMail(emailObj);

        res.redirect('/email?q=reset')
    } catch (err) {
        console.log(err);
        res.json({ msg: 'Server error. Please try again later' });
    }
};

module.exports.getEmailConfirmation = (req, res) => {
    if (req.query.q === "reset") {
        return res.render("email_confirmation", {
            title: 'Password reset email sent',
            content: "You'll recieve an email link on your registered email address. Click on the link to reset your password. After resetting your password, login again to your account.",
        });
    }

    try {
        res.render("email_confirmation", {
            title: 'Verify your account',
            content: "Check you email for account verification.",
        });
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error!",
            url: "/login",
        })
    }
}

module.exports.newPassword = (req, res) => {
    res.render('new_password', {
        title: "Set New Password"
    })
}

module.exports.setNewPassword = async (req, res) => {
    const { password: plaintTextPassword } = req.body;
    const { u, auth } = req.query;
    try {
        const password = await bcrypt.hash(plaintTextPassword, 7);
        let user = await User.findOne({ _id: u, passResetAuthCode: auth });
        if (!user) {
            return res.redirect("/login");
        }

        user = await User.findOneAndUpdate({ _id: u, passResetAuthCode: auth }, {
            $set: {
                'password': password,
                passResetAuthCode: "",
            }
        }, { new: true });
        console.log(user);
        req.session.destroy();
        res.redirect('/login');
    } catch (err) {
        console.log(err);
        res.json({ msg: 'Server Error!' })
    }
}