const express = require('express');

const router = express.Router();

const { getDashboard } = require('../controllers/dashboardController');
const { authentication } = require('../middlewares/authorization');

router.get("/", authentication, getDashboard);

module.exports = router;