const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const actionParamsBuilderController = require("../controlers/ActionParamsBuilder.controler"); 

//router.get("/",  authenticateToken, actionParamsBuilderController.getAll);
router.get("/",   actionParamsBuilderController.getAll);
router.get("/:id",   actionParamsBuilderController.getById);
router.post("/:id",  actionParamsBuilderController.create);
router.put("/:id",   actionParamsBuilderController.update);
router.delete("/:id",   actionParamsBuilderController.delete);

module.exports = router;