const express = require("express");
const router = express.Router();

const categoryController = require("../controlers/Category.controler");


const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

router.get("/",  authenticateToken, categoryController.getAll);
router.post("/:id",  authenticateToken, categoryController.create);
router.get("/:id",  authenticateToken, categoryController.getById);
router.get("/processflow/:id?",  authenticateToken, categoryController.getByProcessFlowId); 
router.put("/:id",  authenticateToken, categoryController.update);
router.delete("/:id",  authenticateToken, categoryController.delete);


module.exports = router;