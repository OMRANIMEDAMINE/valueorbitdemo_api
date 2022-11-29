const express = require("express");
const router = express.Router();

const DealBandController = require("../controlers/DealBand.controler");


const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

router.get("/",  authenticateToken, DealBandController.getAll);
router.post("/",  authenticateToken, DealBandController.create);
router.get("/:id",  authenticateToken, DealBandController.getById);
router.put("/:id",  authenticateToken, DealBandController.update);
router.delete("/:id", authenticateToken, DealBandController.delete);

module.exports = router;