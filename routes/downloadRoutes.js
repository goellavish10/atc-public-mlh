const express = require("express");
const { authentication } = require("../middlewares/authorization");
const router = express.Router();

router.get("/:id", authentication, (req, res) => {
    const id = req.params.id
    res.download(__dirname + `/../${id}.pdf`, `${id}.pdf`, function (err) {
        console.log("Error In downloading: ", err);
    });
})

module.exports = router;