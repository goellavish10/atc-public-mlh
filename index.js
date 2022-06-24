require('dotenv').config({ path: __dirname + '/config/.env' });
const express = require('express');

const app = express();
const MongoStore = require('connect-mongo');
const { connectDB } = require('./config/db');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require("cors");

// Router imports
const signUp = require('./routes/signup');
const login = require('./routes/login');
const resetPassword = require('./routes/resetPassword');
const verifyuser = require('./routes/verifyuser');
const otp = require('./routes/otp');
const dashboard = require('./routes/dashboard');
const logout = require('./routes/logout');
const emailConfirmation = require('./routes/emailConfirmation');
const bookingRoutes = require('./routes/bookingRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const downloadRoutes = require('./routes/downloadRoutes');
const quotationRoutes = require("./routes/quoatationRoutes");
const { authentication } = require('./middlewares/authorization');
const adminRoutes = require("./routes/adminRoute");
const { deleteQuoteJobs } = require('./utils/cronjob');
const Booking = require('./Models/Booking');
const stripe = require('stripe')(process.env.STRIPE_API);
const { apiMiddleware } = require("./middlewares/authorization");
const accountRoutes = require('./routes/accountSettings');
// Connecting to database
connectDB();


// Setting the view engine to ejs
app.set('view engine', 'ejs');

// creating 24 hours from milliseconds
const oneDay = 1000 * 60 * 60 * 24;

// Static files path
app.use(express.static(__dirname + '/public'));

// Cookies and session middlewares
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: oneDay },
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URI
    })
}));

// Processing data
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Home Route
app.get("/", (req, res) => {
    res.redirect('/sign-up');
});

app.get("/error", authentication, (req, res) => {
    res.render("error", {
        title: "Server not responding",
        url: "/booking/checkout",
        content: "If amount is deducted from your card, it will be refuned shortly.",
    })
})

/* Routes */
app.use('/sign-up', signUp);
app.use('/login', login);
app.use('/password-reset', resetPassword);
app.use('/verify-user', verifyuser);
app.use('/dashboard', dashboard);
app.use('/logout', logout);
app.use('/email', emailConfirmation);
app.use('/booking', bookingRoutes);
app.use('/checkout', checkoutRoutes);
app.use('/payment', paymentRoutes);
app.use('/download-label', downloadRoutes);
app.use("/otp-verification", otp);


// Acccount Setting Routes
app.use("/account", accountRoutes);

// Quotation Routes
app.use("/quote", quotationRoutes);

// Admin Routes
app.use("/admin", adminRoutes);


app.get("*", (req, res) => {
    res.render("error", {
        title: "Error",
        url: "/login",
        content: "404! Looks like the page you requested does not exist.",
    })
})


// API ROUTE FOR ATC SYSTEM
const corsOptions = {
    origin: "*",
}
app.post("/api/atc/job-status", [apiMiddleware, cors(corsOptions)], async (req, res) => {
    try {
        // Booking Date in Format YYYY-MM-DD
        const { jobId, bookingDate, status } = req.query;
        console.log(jobId, bookingDate, status);
        let booking = await Booking.findOne({ jobId, bookingDate });
        console.log('----BOOKING UPDATE-----');
        console.log(booking);
        if (!booking) {
            return res.json({ msg: "No Booking found for the provided details" })
        }

        booking = await Booking.findOneAndUpdate({ jobId, bookingDate }, {
            $set: {
                'jobStatus': status,
            }
        }, { new: true });

        console.log("-----UPDATED STATUS-----");
        console.log(booking);

        if (status === "CANCELLED") {
            const refund = await stripe.refunds.create({
                payment_intent: booking.stripePaymentId,
            });
            console.log("------------REFUND---------------");
            console.log(refund);

            booking = await Booking.findOneAndUpdate({ jobId, bookingDate }, {
                $set: {
                    'jobStatus': status,
                }
            }, { new: true });
            console.log("-----UPDATED STATUS-----");
            console.log(booking);
            booking = await Booking.findOneAndDelete({ jobId, bookingDate });
            return res.json({ msg: "Job cancelled and refund initiated" });
        }

        return res.json({ msg: `Job status updated for Job ${jobId} to ${status}` })
    } catch (err) {
        console.log(err);
        res.json({ error: err });
    }
})

// Cron JOB to delete jobs
deleteQuoteJobs();

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server 🔥🔥🔥 up on ${PORT}`));
