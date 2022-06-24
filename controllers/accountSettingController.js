const User = require('../Models/User');

module.exports.savedAddresses = async (req, res) => {
    try {
        console.log("Reaching ACcount Settings")
        res.render("account/manage_saved_addresses", {
            title: "Account Settings",
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error",
            url: "/dashboard",
        })
    }
}

module.exports.accountSettings = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        res.render("account/account_settings", {
            title: "Account Settings",
            name: user.name,
            phone: user?.phoneNumber,
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error",
            url: "/dashboard",
        })
    }
}

module.exports.savedCards = async (req, res) => {
    try {
        res.render("account/manage_credit_cards", {
            title: "Account Settings",
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error",
            url: "/dashboard",
        })
    }
}

module.exports.deleteAccount = async (req, res) => {
    try {
        res.render("account/delete_account", {
            title: "Delete Account",
        })
    } catch (err) {
        console.log(err);
        res.render("error_page", {
            title: "Server Error",
            url: "/dashboard",
        })
    }
}