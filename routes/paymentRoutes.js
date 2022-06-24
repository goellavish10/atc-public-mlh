const express = require("express");
const router = express.Router()

const { getPaymentSuccessfulPage, getPaymentUnsuccessfulPage, submitJobBooking } = require("../controllers/checkoutController");
const { authentication } = require("../middlewares/authorization");

router.get("/done", authentication, submitJobBooking);
router.get("/success/:id", authentication, getPaymentSuccessfulPage);
router.get("/failed", authentication, getPaymentUnsuccessfulPage);

module.exports = router;
