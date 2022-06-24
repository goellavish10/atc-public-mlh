const express = require('express');

const router = express.Router();

const { getEmailConfirmation } = require('../controllers/dashboardController');

router.get("/", getEmailConfirmation);
module.exports = router;