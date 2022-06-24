const Admin = require('../Models/Admin');
const User = require('../Models/User');
const cors = require("cors");
module.exports.authentication = async (req, res, next) => {
    const userId = req.session.userId;
    if (!userId && !req.params.sessionId) {
        console.log('retunring from here');
        return res.redirect('/login?q=session-expired');
    }
    try {
        console.log(userId);
        if (req.session.quoteUser === req.params.sessionId && req.params.sessionId !== undefined) {
            if (userId !== undefined) {
                return res.redirect("/login");
            }
            console.log("REACHING HERE");
            console.log(req.session);
            req.user = req.session.quoteUser;
            next();
            return;
        }
        let user = await User.findById(userId);
        if (!user) {
            let admin = await Admin.findById(userId);
            if (!admin) {
                return res.redirect('/login?q=session-expired');
            }

            const { password, ...userObj } = admin._doc;

            const { _id } = userObj;

            const name = "ADMIN";

            req.user = {
                _id, name, savedAddresses: [], email: "bookings@atccouriers.com.au"
            };
            next();
            return;
        }
        const { password, ...userObj } = user._doc;
        const { _id, name, savedAddresses, email } = userObj;
        req.user = { _id, name, savedAddresses, email };
        next();
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Error!",
            url: "/logout",
        })
    }
}

module.exports.isLoggedIn = async (req, res, next) => {
    const userId = req.session.userId;
    if (!userId) {
        next();
        console.log('reaching here');
        return;
    }
    try {
        let user = await User.findById(userId);
        if (!user) {
            let admin = await Admin.findById(userId);
            if (!admin) {
                return res.redirect('/login');
            }

            const { password, ...userObj } = admin._doc;
            const { _id } = userObj;
            req.user = { _id };
            console.log(req.user);
            return res.redirect('/admin/all');
        }
        const { password, ...userObj } = user._doc;
        const { _id, name } = userObj;
        req.user = { _id, name };
        console.log(req.user);
        res.redirect('/dashboard');
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Error!",
            url: "/logout",
        })
    }
}

module.exports.adminAuthentication = async (req, res, next) => {
    const userId = req.session.userId;
    try {
        const admin = await Admin.findOne({ _id: userId });
        if (!admin) {
            return res.redirect("/login");
        }
        req.user = { role: "admin", id: admin._id };
        next();
    } catch (err) {
        console.log(err);
    }
}

module.exports.apiMiddleware = async (req, res, next) => {
    try {
        const apiKey = req.headers['authorization'];
        if (apiKey !== process.env.API_MIDDLEWARE_KEY) {
            return res.json({ msg: "NOT AUTHORIZED" });
        }

        next();
    } catch (err) {
        console.log(err);
    }
}