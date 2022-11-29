const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const variableBuilderController = require("../controlers/VariableBuilder.controler"); 

//router.get("/",  authenticateToken, conditionBuilderController.getAll);
router.get("/",   variableBuilderController.getAll);
router.get("/:id",   variableBuilderController.getById);
router.post("",   variableBuilderController.create);
router.put("/:id",   variableBuilderController.update);
router.delete("/:id",   variableBuilderController.delete);

module.exports = router;