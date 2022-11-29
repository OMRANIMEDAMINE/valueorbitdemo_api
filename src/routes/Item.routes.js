const express = require("express");
const router = express.Router();

const itemController = require("../controlers/Item.controler");


const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 

router.get("/", authenticateToken, itemController.getAll);
router.post("/:id",  authenticateToken, itemController.create); 
//router.get("/category/:id?", itemController.getByCategoryId);
router.get("/:id?",  authenticateToken, itemController.getById);
router.put("/:id",  authenticateToken, itemController.update);
router.delete("/:id",  authenticateToken, itemController.delete);

/* router.post("/:item_id?/:opportunity_id?", discussionController.create);
router.get("/item_opportunity/:item_id?/:opportunity_id?", discussionController.getByItemIdandOpportunityId);
router.get("/item/:id?", discussionController.getByItemId);
router.get("/opportunity/:id", discussionController.getByOpportunityId); */
module.exports = router;