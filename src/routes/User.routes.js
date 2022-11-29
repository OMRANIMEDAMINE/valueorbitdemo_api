const express = require("express");
const router = express.Router();
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


const userController = require("../controlers/User.controler");


router.post("/",  authenticateToken, userController.create);
 

//router.get("/",  authenticateToken, userController.getAll);
router.get("/",    authenticateToken, userController.getAll);
router.get("/:id",  authenticateToken, userController.getById);
router.get("/auth/findby/:login?/:password?",  userController.getByUsernamePassword);
router.put("/:id",  authenticateToken, userController.update);
router.delete("/:id",  authenticateToken, userController.delete);
router.delete("/",  authenticateToken, userController.deleteAll);

module.exports = router;