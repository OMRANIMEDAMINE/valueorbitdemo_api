const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const variableTypeBuilderController = require("../controlers/VariableTypeBuilder.controler"); 

//router.get("/",  authenticateToken, conditionBuilderController.getAll);
router.get("/",   variableTypeBuilderController.getAll);
router.get("/:id",   variableTypeBuilderController.getById);
router.post("/",   variableTypeBuilderController.create);
router.put("/:id",   variableTypeBuilderController.update);
router.delete("/:id",   variableTypeBuilderController.delete);

module.exports = router;