const express = require("express");
const router = express.Router()

const { otpController, submitOtp, resendOtp } = require("../controllers/authController");

router.get("/", otpController);
router.post("/verify", submitOtp);
router.get("/resent-otp", resendOtp);

module.exports = router;