const express = require("express");
const router = express.Router();


const RollUpController = require("../controlers/RollUp.controller");

router.get("/", RollUpController.getAll);
//router.get("/filtered/go/:fiscalyear?/:fiscalquarter?/:fiscalmonth?", RollUpController.getBy);


router.get("/:id", RollUpController.getById);
router.put("/:id", RollUpController.update);
router.delete("/:id", RollUpController.delete);
router.post("/:id", RollUpController.create);
router.get("/sales/:id?", RollUpController.getAllBySalesId);
router.get("/last/sales/:id?", RollUpController.getLastRollUpBySalesId);
router.post("/load/go", RollUpController.load);

router.get("/sales/filtered/period/:id/:fiscalyear?/:fiscalquarter?/:fiscalmonth?",   RollUpController.getBySalesIdFiltered);


module.exports = router;