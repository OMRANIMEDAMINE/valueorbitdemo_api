const express = require("express");
const router = express.Router();

const ManagerJudgementController = require("../controlers/ManagerJudgement.controler");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 


router.get("/",  authenticateToken, ManagerJudgementController.getAll);
router.post("/",  authenticateToken, ManagerJudgementController.create);
router.get("/:id",  authenticateToken, ManagerJudgementController.getById);
router.put("/:id",  authenticateToken, ManagerJudgementController.update);
router.delete("/:id",  authenticateToken, ManagerJudgementController.delete);

module.exports = router;