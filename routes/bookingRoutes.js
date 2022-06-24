const express = require('express');

const router = express.Router();

const { getBookingStep1, getBookingStep2, getBookingStep3, getBookingStep4, getCheckoutPage, getAddress, postBookingStep1, postBookingStepPaxi, postBookingStep3, postBookingStep4, redirectToBookingStep, postBookingStepFlatRate, postBookingStepExpress, postBookingStepStandard, postBookingStepVIP, getJobDetails, saveDistance, deleteAddress, searchSuburb } = require('../controllers/bookingController');
const { authentication } = require('../middlewares/authorization');

const { getBookingHistory, filterByDate } = require("../controllers/bookingHistoryController");

router.get("/", authentication, redirectToBookingStep)
router.get("/step-1", authentication, getBookingStep1);
router.post("/step-1", authentication, postBookingStep1);
router.get("/step-2", authentication, getBookingStep2);
router.post("/step-2/flatRate", authentication, postBookingStepFlatRate);
router.post("/step-2/paxi", authentication, postBookingStepPaxi);
router.post("/step-2/express", authentication, postBookingStepExpress);
router.post("/step-2/standard", authentication, postBookingStepStandard);
router.post("/step-2/vip", authentication, postBookingStepVIP);
router.get("/step-3", authentication, getBookingStep3);
router.post("/step-3", authentication, postBookingStep3);
router.get("/step-4", authentication, getBookingStep4);
router.post("/step-4", authentication, postBookingStep4);
router.get("/checkout", authentication, getCheckoutPage);
router.get("/address", authentication, getAddress);
router.get("/history", authentication, getBookingHistory);
router.get("/history/filter", authentication, filterByDate);
router.get("/detail/:id", authentication, getJobDetails);
router.post("/save-distance", authentication, saveDistance);
router.put("/delete-address/:id", authentication, deleteAddress);
router.get("/search", authentication, searchSuburb);

module.exports = router;