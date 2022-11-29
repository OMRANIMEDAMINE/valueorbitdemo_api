const express = require("express");
const router = express.Router();

const optionController = require("../controlers/Option.controler");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 


router.get("/",  authenticateToken, optionController.getAll);
router.post("/:id",  authenticateToken, optionController.create);
router.get("/item/:id",  authenticateToken, optionController.getByItemId);
router.get("/:id",  authenticateToken, optionController.getById);
router.put("/:id",  authenticateToken, optionController.update);
router.delete("/:id",  authenticateToken, optionController.delete);



module.exports = router;