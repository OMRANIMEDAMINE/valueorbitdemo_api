const express = require("express");
const router = express.Router();

const contactController = require("../controlers/Guidance.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')

 
//router.get("/:message?/:id?",  authenticateToken,  contactController.getby);
router.get("/:message?/:id?",     contactController.getby);
module.exports = router;