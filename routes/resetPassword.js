const express = require('express');

const router = express.Router();

const { getPasswordReset, resetPassword, newPassword, setNewPassword } = require('../controllers/dashboardController');
const { authentication } = require('../middlewares/authorization')

router.get("/", getPasswordReset);
router.post("/", resetPassword);
router.get("/new-password", newPassword);
router.post("/new-password", setNewPassword);

module.exports = router;