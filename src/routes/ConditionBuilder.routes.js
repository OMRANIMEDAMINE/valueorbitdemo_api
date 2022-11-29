const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const conditionBuilderController = require("../controlers/ConditionBuilder.controler"); 

//router.get("/",  authenticateToken, conditionBuilderController.getAll);
 router.get("/",   conditionBuilderController.getAll);
router.get("/appstyle/go",   conditionBuilderController.getAllAppStyle);
router.get("/byowneridorigin/go/:id",   conditionBuilderController.getAllByOwnerIdOrigin);
router.get("/:id",   conditionBuilderController.getById);
router.post("/",   conditionBuilderController.create);
router.put("/:id",   conditionBuilderController.update);
router.delete("/:id",   conditionBuilderController.delete);

module.exports = router;