const express = require("express");
const router = express.Router();

const ForecastController = require("../controlers/Forecast.controller");

const {
    authenticateToken
} = require('../../middlewares/auth.middleware')


router.post("/",  ForecastController.create);
router.get("/",  ForecastController.getAll);
router.get("/by/go/:createdbyid?/:forecastcategoryname?/:periodtype?/:fiscalyear?/:fiscalquarter?/:fiscalmonth?",  ForecastController.getby);
router.get("/:id",  ForecastController.getById);
router.put("/:id",  ForecastController.update);
router.delete("/:id",  ForecastController.delete);
 

module.exports = router;