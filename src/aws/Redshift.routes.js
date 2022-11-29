const express = require("express");
const router = express.Router();
// const stages = require("../controlers/Stages.controller");

const redshiftContoller = require("./Redshift.controller");

//router.get("/opportunity/all", redshiftContoller.getOpportunityFiltered);
router.get("/opportunity/all", redshiftContoller.getAllOpportunity);
router.get("/account/all", redshiftContoller.getAllAccount); 
router.get("/contact/all", redshiftContoller.getAllContact); 
router.get("/stage/all", redshiftContoller.getAllStage); 
router.get("/opportunityhistorylog/", redshiftContoller.getAllHistoryLog); 
router.get("/opportunityhistorylog/byoppo/:id", redshiftContoller.getAllHistoryLogbyOppo); 
router.get("/forecastingowneradjustment/all", redshiftContoller.getAllForecastingowneradjustment); 
router.get("/forecastingquota/all", redshiftContoller.getAllForecastingquota); 
router.get("/period/all", redshiftContoller.getAllPeriod); 


router.post("/createdb/:db_name", redshiftContoller.createdb); 



module.exports = router;
