const express = require('express');

const router = express.Router();

const { getLogin, postLogin } = require('../controllers/authController');
const { isLoggedIn } = require('../middlewares/authorization');

router.get("/", isLoggedIn, getLogin);
router.post("/", postLogin);

module.exports = router;