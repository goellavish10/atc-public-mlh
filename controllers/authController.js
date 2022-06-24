const { sendMail } = require('../utils/nodemailer');
const bcrypt = require('bcryptjs');
const User = require('../Models/User');
const Booking = require('../Models/Booking');
const crypto = require('crypto');
const { addMember } = require("../utils/mailchimp");
const Admin = require('../Models/Admin');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);

module.exports.getLogin = (req, res) => {
    res.render('login', {
        title: 'Login',
        err: 'Email already exists. Please login'
    })
}

module.exports.postLogin = async (req, res) => {
    const { username, password } = req.body;
    try {
        if (username === "atcca") {
            let admin = await Admin.findOne({ username });
            const result = await compareAsync(password, admin.password);
            console.log(result);
            if (!result) {
                return res.redirect('/login?q=wrong')
            }

            req.session.userId = admin.id;

            return res.redirect("/admin/all");
        }
        let user = await User.findOne({ email: username })
        if (!user) {
            user = await User.findOne({ phoneNumber: username })
            if (!user) {
                return res.redirect('/login?q=wrong')
            }
        }
        if (!user.isVerified) {
            return res.redirect('/login?q=new-user')
        }
        const result = await compareAsync(password, user.password);
        console.log(result);
        if (!result) {
            return res.redirect('/login?q=wrong')
        }
        req.session.userId = user.id;

        console.log(req.session);

        res.redirect('/dashboard')

    } catch (err) {
        console.log(err);
        res.json({ msg: 'Server Error! Please reload page' });
    }
}

module.exports.getSignUp = (req, res) => {
    console.log(req.query.q);
    if (req.query.q !== undefined) {
        console.log('here');
        res.render('index', {
            title: 'Sign Up',
            session: req.query.q,
        })
    } else {
        res.render('index', {
            title: 'Sign Up',
            session: "",
        })
    }


}

module.exports.postSignUp = async (req, res) => {
    const { email, full_name, password: plaintTextPassword } = req.body;

    let { phone } = req.body;
    let session_id = req.query.q;
    try {
        let user = await User.findOne({ email: email });
        if (user) {
            return res.redirect('/login?q=user-exists')
        }
        user = await User.findOne({ phoneNumber: phone });
        if (user && phone !== "") {
            return res.redirect('/login?q=user-exists')
        }

        const password = await bcrypt.hash(plaintTextPassword, 7);

        let userObj = {};

        if (phone !== null && phone !== undefined & phone !== "") userObj.phoneNumber = phone;
        userObj.email = email;
        userObj.name = full_name;
        userObj.password = password;
        const authCode = crypto.randomBytes(256);
        userObj.authCode = authCode.toString('hex');
        user = new User(userObj);
        user = await user.save();
        console.log(user);
        const clientObj = {
            email,
            full_name,
            phone,
            authCode: authCode.toString('hex'),
            userId: user._id,
        };
        addMember(clientObj);
        if (session_id !== undefined) {
            const booking = await Booking.findOneAndUpdate({ quoteUserSessionId: session_id }, {
                $set: {
                    'quoteUserSessionId': null,
                    'user': user._id,
                }
            }, { new: true });
        }
        if (phone) {
            let string;
            const q = crypto.randomBytes(128, function (err, buffer) {
                string = buffer.toString('hex');
            })
            const otp = Math.floor(100000 + Math.random() * 900000);
            user = await User.findByIdAndUpdate(user._id, {
                $set: {
                    'otpCode': otp,
                    'phoneNumber': phone.trim(),
                }
            }, { new: true });

            let arr = [...phone];

            if (arr[0] === "0") {
                arr.shift();
            }

            phone = arr.join("");
            client.messages
                .create({ body: `Hi there, your One-Time Password for verification of your phone number on ATC Courier Service Website is ${otp}`, from: '+61485867233', to: `+61${phone}` })
                .then(message => console.log(message.sid));
            return res.redirect(`/otp-verification?q=${string}&u=${user._id}`);
        }
        sendMail(clientObj);
        res.redirect('/email?q=new-account&u=' + user._id);
    } catch (err) {
        console.log(err);
        return res.render('error_page', {
            title: 'Sign Up',
            url: "/sign-up",
        })
    }
}

module.exports.verifyUser = async (req, res) => {
    const authCode = req.query.q;
    const userId = req.query.u;

    try {
        let user = await User.findById(userId);

        if (!user) {
            return res.render("error_page", {
                content: "Not a valid link!",
                url: "/sign-up",
                title: "Please Sign Up",
            });
        }
        console.log("Reaching outside if block");
        if (authCode === user.authCode) {
            user = await User.findByIdAndUpdate(userId, {
                $set: {
                    'authCode': null,
                    'isVerified': true,
                }
            },
                {
                    new: true,
                }
            );

            console.log(user);
            req.session.userId = user.id;

            console.log(req.session);

            res.redirect('/booking');
        } else {
            console.log("NOT AUTHORIZED");
            res.render("error_page", {
                content: "Not a valid link!",
                url: "/sign-up",
                title: "Please Sign Up",
            });
        }
    } catch (err) {
        console.log(err);
        return res.render("error_page", {
            content: "Not a valid link!",
            url: "/sign-up",
            title: "Please Sign Up",
        });
    }
}

module.exports.logout = (req, res) => {
    req.session.destroy();
    res.redirect('/login');
}

module.exports.otpController = async (req, res) => {
    const userId = req.query.u;
    try {
        const user = await User.findById(userId);
        console.log(user);
        res.render("otp", {
            title: "Phone Verification",
            phone: user.phoneNumber.substr(6, 9),
        })
    } catch (err) {
        console.log(err);
        await User.findByIdAndDelete(userId, function (err, result) {
            if (err) throw err;

            console.log(result);
            console.log("User Deleted.");
        })
        res.render("error_page", {
            title: "Server Error!",
            url: "/sign-up",
        })
    }
}

module.exports.submitOtp = async (req, res) => {
    const userId = req.query.u;
    console.log(userId);
    try {
        const { otp } = req.body;
        let user = await User.findById(userId);

        const storedOtp = user.otpCode;

        if (otp !== storedOtp) {
            return res.json({ msg: "Incorrect OTP! Please enter the correct One-Time Password" });
        }

        user = await User.findOneAndUpdate({ _id: userId }, {
            $set: {
                'isPhoneVerified': true,
            }
        }, { new: true });
        const clientObj = {
            email: user.email,
            full_name: user.name,
            phone: user.phoneNumber,
            authCode: user.authCode.toString('hex'),
            userId: user._id,
        };
        sendMail(clientObj);
        // res.redirect("/email");
        res.json({ msg: true });
    } catch (err) {
        console.log(err);
        let string;
        const q = crypto.randomBytes(128, function (err, buffer) {
            string = buffer.toString('hex');
        })
        res.render("error_page", {
            title: "Server Error!",
            url: `/otp-verification?q=${string}&u=${userId}`,
        })
    }
}

module.exports.resendOtp = async () => {
    const userId = req.query.u;
    console.log(userId);
    try {
        let user = await User.findByIdAndUpdate(userId, {
            $set: {
                'otpCode': "",
            }
        }, { new: true });

        if (!user) {
            return res.redirect("/sign-up");
        }

        let string;
        crypto.randomBytes(128, function (err, buffer) {
            string = buffer.toString('hex');
        })
        const otp = Math.floor(100000 + Math.random() * 900000);
        user = await User.findByIdAndUpdate(user._id, {
            $set: {
                'otpCode': otp,
            }
        }, { new: true });
        client.messages
            .create({ body: `Hi there, your One-Time Password for verification of your phone number on ATC Courier Service Website is ${otp}`, from: '+19472227872', to: `+61${user.phoneNumber}` })
            .then(message => console.log(message.sid));
        return res.redirect(`/otp-verification?q=${string}&u=${user._id}`);
    } catch (err) {
        console.log(err);
        let string;
        const q = crypto.randomBytes(128, function (err, buffer) {
            string = buffer.toString('hex');
        })
        res.render("error_page", {
            title: "Server Error!",
            url: `/otp-verification?q=${string}&u=${userId}`,
        })
    }
}

function compareAsync(param1, param2) {
    return new Promise(function (resolve, reject) {
        bcrypt.compare(param1, param2, function (err, res) {
            if (err) {
                reject(err);
            } else {
                resolve(res);
            }
        });
    });
}

