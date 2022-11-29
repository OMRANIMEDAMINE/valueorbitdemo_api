const express = require("express");
const router = express.Router();

const processFlowController = require("../controlers/ProcessFlow.controler");


const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


//router.get("/manager/:id?", processFlowController.getAllByManagerId);
//router.get("/sales/:id?", processFlowController.getAllBySalesId); 

router.get("/",  authenticateToken, processFlowController.getAll);
router.post("/",  authenticateToken, processFlowController.create);
router.post("/manager/:id",  authenticateToken, processFlowController.createBasedOnManagerID);


router.get("/:id",  authenticateToken, processFlowController.getById);
router.get("/dealprogress/:id",  authenticateToken, processFlowController.getProgressDealByProcessFlowId);

router.put("/:id",  authenticateToken, processFlowController.update);
router.delete("/:id",  authenticateToken, processFlowController.delete);

module.exports = router;