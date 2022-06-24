const express = require("express");
const router = express.Router()

const { getBookingStep1, postBookingStep1, getBookingStep2, postBookingStepFlatRate, postBookingStepPaxi, postBookingStepStandard, postBookingStepExpress, postBookingStepVIP, getBookingStep3, postBookingStep3, getBookingStep4, postBookingStep4, getCheckoutPage, getAddress, saveDistance } = require("../controllers/bookingController");
const { authentication } = require("../middlewares/authorization");

router.get("/step-1", getBookingStep1);
router.get("/step-1/:sessionId", authentication, getBookingStep1);
router.post("/step-1/:sessionId", authentication, postBookingStep1);
router.get("/step-2/:sessionId", authentication, getBookingStep2);
router.post("/step-2/flatRate/:sessionId", authentication, postBookingStepFlatRate);
router.post("/step-2/paxi/:sessionId", authentication, postBookingStepPaxi);
router.post("/step-2/express/:sessionId", authentication, postBookingStepExpress);
router.post("/step-2/standard/:sessionId", authentication, postBookingStepStandard);
router.post("/step-2/vip/:sessionId", authentication, postBookingStepVIP);
router.get("/step-3/:sessionId", authentication, getBookingStep3);
router.post("/step-3/:sessionId", authentication, postBookingStep3);
router.get("/step-4/:sessionId", authentication, getBookingStep4);
router.post("/step-4/:sessionId", authentication, postBookingStep4);
router.get("/checkout/:sessionId", authentication, getCheckoutPage);
router.get("/address/:sessionId", authentication, getAddress);
router.post("/save-distance/:sessionId", authentication, saveDistance);

module.exports = router;