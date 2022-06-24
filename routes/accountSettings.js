const express = require("express");
const { authentication } = require("../middlewares/authorization");
const router = express.Router()

const { savedAddresses, accountSettings, savedCards, deleteAccount } = require("../controllers/accountSettingController");

router.get("/settings", authentication, accountSettings);
router.get("/saved-addresses", authentication, savedAddresses);
router.get("/saved-cards", authentication, savedCards);
router.get("/delete-account", authentication, deleteAccount);

module.exports = router;