const express = require("express");
const router = express.Router();

const messageController = require("../controlers/Message.controler");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 


router.get("/", authenticateToken, messageController.getAll);
router.post("/:item_id?/:opportunity_id?/:user_id?",   messageController.create);
router.get("/item/:id",  authenticateToken, messageController.getByItemId);
router.get("/opportunity/:id", authenticateToken,  messageController.getByOppoId);
router.get("/opportunity/filteredby/:id",  authenticateToken, messageController.getByOppoIdFilteredBy2);
//router.get("/opportunity/filteredby2/:id", messageController.getByOppoIdFilteredBy);

router.get("/:id",  authenticateToken, messageController.getById);
router.put("/:id",  authenticateToken, messageController.update);
router.delete("/:id",  authenticateToken, messageController.delete);

module.exports = router;