const express = require('express');

const router = express.Router();

const { getSignUp, postSignUp } = require('../controllers/authController');
const { isLoggedIn } = require('../middlewares/authorization');

router.get("/", isLoggedIn, getSignUp);
router.post("/", postSignUp);

module.exports = router;