const express = require("express");
const router = express.Router();

const itemTemplateController = require("../controlers/ItemTemplate.controler");


router.get("/", itemTemplateController.getAll);
router.post("/:id", itemTemplateController.create);
router.get("/categorytemplate/:id?", itemTemplateController.getByCategoryTemplateId);
router.get("/:id?", itemTemplateController.getById);
router.put("/:id", itemTemplateController.update);
router.delete("/:id", itemTemplateController.delete);

//Getallby Opportunity..

module.exports = router;