const express = require("express");
const router = express.Router();
const opportunityController = require("../controlers/Opportunity.controler");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')
 


router.get("/",   opportunityController.getAll);
router.get("/for_ai/all", opportunityController.getAllForAI);
router.get("/for_me/allids", opportunityController.getAllIDS);

 
 
router.get("/count/go",  authenticateToken, opportunityController.getCount);
router.get("/originid/:id",  authenticateToken, opportunityController.getByOriginId);



router.get("/filtered/for_ai/go/:fiscalyear?/:fiscalmonth?/:fiscalquarter?/:forecastcategory?/:stagename?/:amountmin?/:amountmax?",  opportunityController.getByForAI);
router.get("/filtered/:fiscalyear?/:fiscalmonth?/:fiscalquarter?/:forecastcategory?/:stagename?/:amountmin?/:amountmax?",   authenticateToken, opportunityController.getBy);
router.post("/:id",  authenticateToken, opportunityController.create);
router.get("/:id",  authenticateToken, opportunityController.getById);
router.put("/:id",   opportunityController.update);

/*** SALES FORCE UPDATES **/
router.put("/amount/:id/:iduser",  authenticateToken, opportunityController.updateAmount);
router.put("/stagename/:id/:iduser",  authenticateToken, opportunityController.updateStageName);
router.put("/closedate/:id/:iduser",  authenticateToken, opportunityController.updateCloseDate);
//router.put("/forecastcategoryname/:id/:iduser",  authenticateToken, opportunityController.updateForecastCategoryName);
router.put("/nextstep/:id/:iduser",  authenticateToken, opportunityController.updateNextStep);



router.delete("/:id",  authenticateToken, opportunityController.delete);
router.get("/sales/:id?",  authenticateToken, opportunityController.getBySalesId);
router.get("/manager/:id?",  authenticateToken, opportunityController.getByManagerId);
router.get("/manager/filtered/:id/:fiscalyear?/:fiscalmonth?/:fiscalquarter?/:forecastcategory?/:stagename?/:amountmin?/:amountmax?",   authenticateToken, opportunityController.getByManagerFilteredBy);
router.get("/sales/filtered/:id/:fiscalyear?/:fiscalmonth?/:fiscalquarter?/:forecastcategory?/:stagename?/:amountmin?/:amountmax?",   authenticateToken, opportunityController.getBySalesFilteredBy);


//Set playbook to oppo
router.put("/setplaybook/go/:opportunity?/:processflowtemplate?",  opportunityController.setPlaybookToOppo);
router.put("/setplaybook/sales/go/:opportunity?/:sales?",  opportunityController.setPlaybookToSales);



/***TEST REMPLISSAGE */
//router.post("/remplir/remplir/:id", opportunityController.remplir);
//router.get("/admin/", opportunityController.getByManagerId);
module.exports = router;

 