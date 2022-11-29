const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const variableTypeInputBuilderController = require("../controlers/VariableTypeInputBuilder.controler"); 

//router.get("/",  authenticateToken, variableTypeInputBuilderController.getAll);
router.get("/",   variableTypeInputBuilderController.getAll);
router.get("/:id",   variableTypeInputBuilderController.getById);
router.post("/:id",   variableTypeInputBuilderController.create);
router.put("/:id",   variableTypeInputBuilderController.update);
router.delete("/:id",   variableTypeInputBuilderController.delete);

module.exports = router;