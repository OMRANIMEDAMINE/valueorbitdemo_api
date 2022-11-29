const express = require("express");
const router = express.Router();
const signalMRController = require("../controlers/SignalMR.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
//router.get("/names/go", authenticateToken, OpportunityStageController.getAllNames);


router.post("/", signalMRController.create);
router.get("/", signalMRController.getAll);
router.get("/:id", signalMRController.getById);
router.get("/by/go/:category?/:id?", signalMRController.getby);
router.get("/sales/go/:id", signalMRController.getbyofsales);
router.get("/manager/go/:id/:category?", signalMRController.getbyofmanager);
 

router.get("/ids/go", signalMRController.getAll_IDS);
router.post("/load/go", signalMRController.load);
router.delete("/:id", signalMRController.delete);
router.put("/:id", signalMRController.update);
 
 
module.exports = router;