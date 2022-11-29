const express = require("express");
const router = express.Router();

const processFlowTemplateController = require("../controlers/ProcessFlowTemplate.controler");



router.get("/", processFlowTemplateController.getAll);
router.get("/manager/:id", processFlowTemplateController.getByManagerId);
router.post("/", processFlowTemplateController.create);
router.get("/:id?", processFlowTemplateController.getById);
router.put("/:id", processFlowTemplateController.update);
router.delete("/:id", processFlowTemplateController.delete);

router.get("/availablemanager/go", processFlowTemplateController.getAllAvailableManager);
router.put("/manager/add/", processFlowTemplateController.addManager);
router.put("/manager/remove/", processFlowTemplateController.removeManager);

module.exports = router;