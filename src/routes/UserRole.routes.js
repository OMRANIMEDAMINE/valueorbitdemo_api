const express = require("express");
const router = express.Router();

const userRoleController = require("../controlers/UserRole.controler");
const {
    authenticateToken
} = require('../../middlewares/auth.middleware')

router.post("/", authenticateToken, userRoleController.create); 
router.get("/", authenticateToken, userRoleController.getAll);
router.get("/:id", authenticateToken, userRoleController.getById);
router.put("/:id", authenticateToken, userRoleController.update);
router.delete("/:id", authenticateToken, userRoleController.delete);
router.delete("/", authenticateToken, userRoleController.deleteAll);

module.exports = router;