const express = require("express");
const router = express.Router();

const categoryTemplateController = require("../controlers/CategoryTemplate.controler");

 

router.get("/", categoryTemplateController.getAll);
router.post("/:id", categoryTemplateController.create);
router.get("/:id", categoryTemplateController.getById);
router.get("/processflowtemplate/:id?", categoryTemplateController.getByProcessFlowTemplateId); 
router.put("/:id", categoryTemplateController.update);
router.delete("/:id", categoryTemplateController.delete);

module.exports = router;