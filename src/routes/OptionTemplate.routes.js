const express = require("express");
const router = express.Router();

const optionTemplateController = require("../controlers/OptionTemplate.controler");



router.get("/", optionTemplateController.getAll);
router.post("/:id", optionTemplateController.create);
router.get("/itemtemplate/:id", optionTemplateController.getByItemTemplateId);
router.get("/:id", optionTemplateController.getById);
router.put("/:id", optionTemplateController.update);
router.delete("/:id", optionTemplateController.delete);



module.exports = router;