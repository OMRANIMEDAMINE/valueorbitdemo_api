const express = require("express");
const router = express.Router();

const salesUserController = require("../controlers/SalesUser.controler");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

router.get("/",  authenticateToken, salesUserController.getAll);
router.post("/:id",  authenticateToken, salesUserController.create);
router.get("/manager/:id?",  authenticateToken, salesUserController.getByManagerId);
router.get("/:id?",  authenticateToken, salesUserController.getById);
router.get("/auth/findby/:login?/:password?",  authenticateToken, salesUserController.getByUsernamePassword);
router.put("/:id",  authenticateToken, salesUserController.update);
router.delete("/:id",  authenticateToken, salesUserController.delete);

module.exports = router;