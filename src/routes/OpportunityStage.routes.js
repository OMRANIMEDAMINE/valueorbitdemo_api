const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


const OpportunityStageController = require("../controlers/OpportunityStage.controller");

router.get("/names/go", authenticateToken, OpportunityStageController.getAllNames);

 
router.get("/",  authenticateToken, OpportunityStageController.getAll);
router.get("/:id",  authenticateToken, OpportunityStageController.getById);
router.post("/",  authenticateToken, OpportunityStageController.create);
router.put("/:id",  authenticateToken, OpportunityStageController.update);
router.delete("/:id",  authenticateToken, OpportunityStageController.delete);

module.exports = router;