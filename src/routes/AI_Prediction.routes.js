const express = require("express");
const router = express.Router();
 

const AI_PredictionController = require("../controlers/AI_Prediction.controller");

router.get("/", AI_PredictionController.getAll);
router.get("/filtered/go/:fiscalyear?/:fiscalquarter?/:fiscalmonth?", AI_PredictionController.getBy);
 

router.get("/:id", AI_PredictionController.getById);
router.put("/:id", AI_PredictionController.update);
router.delete("/:id", AI_PredictionController.delete);
router.get("/load/go", AI_PredictionController.load);
router.get("/test/go", AI_PredictionController.test);


/* router.get("/opportunity/:id?", AI_PredictionController.getAllByOpportunityId);
router.get("/lastprediction/opportunity/:id?", AI_PredictionController.getLastPredictionByOpportunityId);
router.post("/:id", AI_PredictionController.create); */



module.exports = router;