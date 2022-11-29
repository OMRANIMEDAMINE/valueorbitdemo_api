const express = require("express");
const router = express.Router();
const actionMRController = require("../controlers/ActionMR.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
//router.get("/names/go", authenticateToken, OpportunityStageController.getAllNames);


router.post("/", actionMRController.create);
router.get("/", actionMRController.getAll);
router.get("/:id", actionMRController.getById);

router.get("/by/go/:category?/:id?", actionMRController.getby);
router.get("/sales/go/:id", actionMRController.getbyofsales);
router.get("/manager/go/:id/:category?", actionMRController.getbyofmanager);

router.get("/ids/go", actionMRController.getAllIDs);
router.post("/load/go", actionMRController.load);
router.delete("/:id", actionMRController.delete);
router.put("/:id", actionMRController.update);
 

module.exports = router;