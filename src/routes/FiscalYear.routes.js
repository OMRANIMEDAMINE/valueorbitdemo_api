const express = require("express");
const router = express.Router();

const FiscalYearController = require("../controlers/FiscalYear.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


router.post("/",  FiscalYearController.create);
//router.get("/",  FiscalYearController.getAll);
router.get("/",  FiscalYearController.getFiscalYearSetting);
router.put("/:id",  FiscalYearController.update); 
router.delete("/:id",  FiscalYearController.delete); 
 

module.exports = router;