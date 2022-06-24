const express = require('express');

const router = express.Router();

const { checkoutController } = require("../controllers/checkoutController");
const { authentication } = require('../middlewares/authorization');

router.get("/create-checkout-session", authentication, checkoutController);

module.exports = router;