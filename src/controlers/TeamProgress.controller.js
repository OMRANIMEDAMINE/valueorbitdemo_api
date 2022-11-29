const logger = require('../../config/logger');
//const ObjectID = require('mongoose').Types.ObjectId;


const TargetModel = require("../models/Target.model"); 
const ForecastModel = require("../models/Forecast.model"); 
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
 
 
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}
 
 
exports.getby = async (req, res) => {
  try {
    var query = {};
 
    if (req.query.periodtype) {
      query["periodtype"] = req.query.periodtype
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }
    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
    }

    if (req.query.createdbyid) {
      query["createdbyid"] = req.query.createdbyid
    }
  
/*     const finded = await TargetModel.findOne(query).sort({
      createddate: 1
    }) */
    //const finded = await ForecastModel.find(query).sort({ field: 'asc', _id: -1 }).limit(1);


    let repsSalesTarget = [] 
    let repsSalesForecastCommit = [] 
    let repsSalesForecastBestCase = [] 
    const relatedManager = await ManagerModel.findById(req.query.createdbyid);
    if (relatedManager) {
      // REPS COMMIT / BEST CASE AND QUOTA FOR the SALES OF this MANAGER
      for (let sales of relatedManager.salesusers) {
        // RELATED SALES
        let relatedSales = await SalesModel.findById(sales);
        if (relatedSales) {
          query["createdbyid"] = relatedSales.id ;          
          // GET Target
          const findedTargetSales = await TargetModel.find(query).sort({ field: 'asc', _id: -1 }).limit(1);
          if (findedTargetSales) {
            repsSalesTarget.push(findedTargetSales)
          } else {
            repsSalesTarget.push(null)
          } 
          // GET Forecast Commit
          query["forecastcategoryname"] = "commit" ; 
          const findedrepsSalesForecastCommit = await ForecastModel.find(query).sort({ field: 'asc', _id: -1 });//.limit(1);
          if (findedrepsSalesForecastCommit) {
            repsSalesForecastCommit.push(findedrepsSalesForecastCommit)
          } else {
            repsSalesForecastCommit.push(null)
          }
          // GET Forecast BestCase
          query["forecastcategoryname"] = "bestcase" ; 
          const findedrepsSalesForecastBestCase = await ForecastModel.find(query).sort({ field: 'asc', _id: -1 }).limit(1);
          if (findedrepsSalesForecastBestCase) {
            repsSalesForecastBestCase.push(findedrepsSalesForecastBestCase)
          } else {
            repsSalesForecastBestCase.push(null)
          }


        }
      }
    }

    


    res.status(200).json({
      success: true,
     // data: finded,
      repsSalesTarget: repsSalesTarget,
      repsSalesForecastCommit: repsSalesForecastCommit,
      repsSalesForecastBestCase: repsSalesForecastBestCase
    });


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};