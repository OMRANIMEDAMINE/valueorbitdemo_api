const express = require("express");
const router = express.Router();

const TargetController = require("../controlers/target.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


router.post("/",  TargetController.create);
router.get("/",  TargetController.getAll);
router.get("/by/go/:createdbyid?/:periodtype?/:fiscalyear?/:fiscalquarter?/:fiscalmonth?",  TargetController.getby);
router.get("/:id",  TargetController.getById);
router.put("/:id",  TargetController.update);
router.delete("/:id",  TargetController.delete);
 

module.exports = router;