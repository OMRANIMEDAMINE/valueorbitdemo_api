const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

const actionBuilderController = require("../controlers/ActionBuilder.controler"); 

//router.get("/",  authenticateToken, actionBuilderController.getAll);
router.get("/",   actionBuilderController.getAll);
router.get("/:id",   actionBuilderController.getById);
router.post("/",  actionBuilderController.create);
router.put("/:id",   actionBuilderController.update);
router.delete("/:id",   actionBuilderController.delete);

module.exports = router;