const express = require('express');

const router = express.Router();

const { verifyUser } = require('../controllers/authController');

router.get("/", verifyUser);

module.exports = router;