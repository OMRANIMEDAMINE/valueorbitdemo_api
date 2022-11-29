const express = require("express");
const router = express.Router();

const TeamProgressController = require("../controlers/TeamProgress.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')



router.get("/:createdbyid?/:periodtype?/:fiscalyear?/:fiscalquarter?/:fiscalmonth?",  TeamProgressController.getby);

module.exports = router;