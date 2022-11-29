const AI_PredictionModel = require("../models/AI_Prediction.model");
const AI_Opportunity_PredictionModel = require("../models/AI_Opportunity_Prediction.model");
const AI_Prediction_manager_AI_Commit_Model = require("../models/AI_Prediction_manager_AI_Commit.model");
const AI_Prediction_manager_AI_Bestcase_Model = require("../models/AI_Prediction_manager_AI_Bestcase.model");
const AI_Prediction_sales_AI_Commit_Model = require("../models/AI_Prediction_sales_AI_Commit.model");
const AI_Prediction_sales_AI_Bestcase_Model = require("../models/AI_Prediction_sales_AI_Bestcase.model");
const OpportunityModel = require("../models/Opportunity.model");
const ManagerUserModel = require("../models/ManagerUser.model");
const SalesUserModel = require("../models/SalesUser.model");
const ObjectID = require('mongoose').Types.ObjectId;
const fetch = require('node-fetch');
const FiscalYearSettingModel = require("../models/FiscalYearSetting.model");
const axios = require('axios');
const setTZ = require("set-tz");
const logger = require('../../config/logger');

//Set Time Zone
setTZ('Europe/Jersey')

// Moment Config
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}
 


const GetPredictionsFromAI = async (url) => {
  try {
   // console.log(url)
   logger.info(`Getting Predictions from AI is started on ${url}.`)
    let res = await axios.get(url);
    // Work with the response...
    logger.info(`Getting Predictions from AI works properly on ${url}.`)
    return res;
  } catch (error) {
    if (error.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Getting Predictions from AI not works - sync api return an error response on ${url} !-- Details: ${error.message} `)

    } else if (error.request) {
      // The client never received a response, and the request was never left
      logger.error(`Getting Predictions from AI not works -  The api never received a response from sync api, and the request was never left on ${url}! -- Details: ${""+error.message}`)
    } else {
      // Anything else
      logger.error(`Getting Predictions from AI not works - unknown error on ${url}! -- Details: ${error.message} `)
    }
  }
};


exports.test = async (req, res) => {
  try {
    
    // try to get the current fiscal month, quarter and year from settings

    const data = await FiscalYearSettingModel.findOne().sort({
      _id: -1
    }); 

    const startmonth = data.startmonth;
    console.log(`Current startmonth  : ${startmonth } `)
    
    const getQuarter = (startmonth) => {
      let quarter = parseInt((moment().month() + 1 - startmonth) / 3 + 1);
      if (moment().month() + 1 - startmonth < 0) {
        quarter = 4;
      }
      if (moment().month() + 1 - startmonth === 0) {
        quarter = 1;
      }
      return quarter;
    };

    var date = new Date(); 
    var current_date = moment((new Date()), "DD.MM.YYYY");
    const current_fiscal_month = (current_date.month() + 1 );
    const current_fiscal_quarter = getQuarter(startmonth);
    let current_fiscal_year = current_date.year();   
    if (current_fiscal_month < startmonth)
    current_fiscal_year = current_fiscal_year - 1 
    console.log(`current_date : ${date } -- setting start month: ${startmonth } -- Current fiscal year : ${current_fiscal_year } - quarter : ${current_fiscal_quarter } - month ${current_fiscal_month }  `);

  
 

   // https://ec2-18-117-177-7.us-east-2.compute.amazonaws.com:8080/predict?fiscalyear=2022&fiscalquarter=4&fiscalmonth=11

  
 

    res.status(200).json({
      success: true
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
};

exports.load = async (req, res) => {
  try {

    const data = await FiscalYearSettingModel.findOne().sort({
      _id: -1
    }); 

    const startmonth = data.startmonth;
    //console.log(`Current startmonth  : ${startmonth } `)
    
    const getQuarter = (startmonth) => {
      let quarter = parseInt((moment().month() + 1 - startmonth) / 3 + 1);
      if (moment().month() + 1 - startmonth < 0) {
        quarter = 4;
      }
      if (moment().month() + 1 - startmonth === 0) {
        quarter = 1;
      }
      return quarter;
    };

    var date = new Date(); 
    var current_date = moment((new Date()), "DD.MM.YYYY");
    const current_fiscal_month = (current_date.month() + 1 );
    const current_fiscal_quarter = getQuarter(startmonth);
    let current_fiscal_year = current_date.year();   
    if (current_fiscal_month < startmonth)
    current_fiscal_year = current_fiscal_year - 1 
    console.log(`current_date : ${date } -- setting start month: ${startmonth } -- Current fiscal year : ${current_fiscal_year } - quarter : ${current_fiscal_quarter } - month ${current_fiscal_month }  `);

  
   // https://ec2-18-117-177-7.us-east-2.compute.amazonaws.com:8080/predict?fiscalyear=2022&fiscalquarter=4&fiscalmonth=11

    logger.info(`Current fiscal year : ${current_fiscal_year } - quarter : ${current_fiscal_quarter } - month ${current_fiscal_month }  `);
 

    //YEARLY  Predictions 
    const yearlyResults = await GetPredictionsFromAI(`${process.env.AI_BASE_URL_8080}/predict?fiscalyear=${current_fiscal_year}`);
    if (!yearlyResults) {
      throw Error("Getting YEARLY Predictions from AI not works !! Check with Administrator");
    } else {
      let json = yearlyResults.data;
      console.log("Yearly predictions saving process started . . .");
      //console.log(yearlyResults.data);
      let ai_prediction = new AI_PredictionModel();
      json.AI_Bestcase.value ? ai_prediction.ai_best_case = json.AI_Bestcase.value : ai_prediction.ai_best_case = null;
      json.AI_Forecast.value ? ai_prediction.ai_commit = json.AI_Forecast.value : ai_prediction.ai_commit = null;
      ai_prediction.type = "Yearly";
      ai_prediction.createddate = Date.now();

      ai_prediction.fiscalyear = current_fiscal_year;
      ai_prediction.fiscalquarter = current_fiscal_quarter;
      ai_prediction.fiscalmonth = current_fiscal_month;
      ai_prediction.ai_opportunity_predictions = [];
      let ai_predictionSaved = await ai_prediction.save();

      // AI OPPO Prediction
      if (json.AI_OPP.data.length > 0) {
        json.AI_OPP.data.forEach(async element => {
          if (element.opp_id == "undefined") {
            logger.info(`YEARLY prediction sync process : Opportunity ID ${element.opp_id} is Undefined `);
          } else {
            const Opporupdated = await OpportunityModel.findOneAndUpdate({
              idorigin: element.opp_id
            }, {
              risk: element?.risk,
              estimatedCloseDate: element?.estimatedCloseDate
            });
           // console.log(Opporupdated)
          }
        })
      }
      logger.info(` Saving ${json.AI_OPP.data.length} new Yearly opportunity predictions works properly `)

      //sync ai_prediction_manager_ai_best_case 
      if (json.manager_AI_Bestcase.length > 0) {
        json.manager_AI_Bestcase.forEach(async element => {
          // console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.info(`YEARLY prediction sync process : sales_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(` Saving ${json.manager_AI_Bestcase.length} new Yearly  manager ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_best_case 
      if (json.sales_AI_Bestcase.length > 0) {
        json.sales_AI_Bestcase.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(` Saving ${json.sales_AI_Bestcase.length} new Yearly  sales ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_commit 
      if (json.sales_AI_Forecast.length > 0) {
        json.sales_AI_Forecast.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - Saving ${json.sales_AI_Forecast.length} new Yearly  sales ai Forecast predictions works properly `)

      //sync ai_prediction_manager_ai_commit 
      if (json.manager_AI_Forecast.length > 0) {
        json.manager_AI_Forecast.forEach(async element => {
          //console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : manager_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.manager_AI_Forecast.length} new Yearly  manager ai Forecast predictions works properly `)



    }


    //Quarterly  Predictions 
    const quarterlyResults = await GetPredictionsFromAI(`${process.env.AI_BASE_URL_8080}/predict?fiscalyear=${current_fiscal_year}&fiscalquarter=${current_fiscal_quarter}`);
    if (!quarterlyResults) {
      throw Error("Getting Quarterly Predictions from AI not works !! Check with Administrator")
    } else {
      let json = quarterlyResults.data;
      logger.info(`Quarterly predictions saving process started . . .`);
      //await fetch(`${process.env.AI_BASE_URL_8080}/predict?fiscalyear=${current_fiscal_year}&fiscalquarter=${current_fiscal_quarter}`)
      let ai_prediction = new AI_PredictionModel();
      json.AI_Bestcase.value ? ai_prediction.ai_best_case = json.AI_Bestcase.value : ai_prediction.ai_best_case = null;
      json.AI_Forecast.value ? ai_prediction.ai_commit = json.AI_Forecast.value : ai_prediction.ai_commit = null;
      ai_prediction.type = "Quarterly";
      ai_prediction.createddate = Date.now();
      ai_prediction.fiscalyear = current_fiscal_year;
      ai_prediction.fiscalquarter = current_fiscal_quarter;
      ai_prediction.fiscalmonth = current_fiscal_month;
      let ai_predictionSaved = await ai_prediction.save();

      //sync ai_oppo 
      if (json.AI_OPP.data.length > 0) {
        json.AI_OPP.data.forEach(async element => {
          if (element.opp_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : Opportunity ID ${element.opp_id} is Undefined `);
          } else {
            await OpportunityModel.findOneAndUpdate({
              idorigin: element.opp_id
            }, {
              risk: element?.risk,
              estimatedCloseDate: element?.estimatedCloseDate
            });
          }
        })
      }
      logger.info(`Saving ${json.AI_OPP.data.length} new Quarterly opportunity predictions works properly `)

      //sync ai_prediction_manager_ai_best_case 
      if (json.manager_AI_Bestcase.length > 0) {
        json.manager_AI_Bestcase.forEach(async element => {
          //console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.manager_AI_Bestcase.length} new Quarterly  manager ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_best_case 
      if (json.sales_AI_Bestcase.length > 0) {
        json.sales_AI_Bestcase.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.sales_AI_Bestcase.length} new Quarterly  sales ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_commit 
      if (json.sales_AI_Forecast.length > 0) {
        json.sales_AI_Forecast.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.sales_AI_Forecast.length} new Quarterly  sales ai Forecast predictions works properly `)

      //sync ai_prediction_manager_ai_commit 
      if (json.manager_AI_Forecast.length > 0) {
        json.manager_AI_Forecast.forEach(async element => {
          //console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : manager_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.manager_AI_Forecast.length} new Quarterly  manager ai Forecast predictions works properly `)

    };


    //Monthly  Predictions 
    const monthlyResults = await GetPredictionsFromAI(`${process.env.AI_BASE_URL_8080}/predict?fiscalyear=${current_fiscal_year}&fiscalquarter=${current_fiscal_quarter}&fiscalmonth=${current_fiscal_month}`);
    if (!monthlyResults) {
      throw Error("Getting Monthly Predictions from AI not works !! Check with Administrator");
    } else {
      let json = monthlyResults.data;
      logger.info(`Monthly predictions saving process started . . .`);
      //await fetch(`${process.env.AI_BASE_URL_8080}/predict?fiscalyear=${current_fiscal_year}&fiscalquarter=${current_fiscal_quarter}&fiscalmonth=${current_fiscal_month}`)

      let ai_prediction = new AI_PredictionModel();
      json.AI_Bestcase.value ? ai_prediction.ai_best_case = json.AI_Bestcase.value : ai_prediction.ai_best_case = null;
      json.AI_Forecast.value ? ai_prediction.ai_commit = json.AI_Forecast.value : ai_prediction.ai_commit = null;
      ai_prediction.type = "Monthly";
      ai_prediction.createddate = Date.now();
      ai_prediction.fiscalyear = current_fiscal_year;
      ai_prediction.fiscalquarter = current_fiscal_quarter;
      ai_prediction.fiscalmonth = current_fiscal_month;
      //ai_prediction.ai_opportunity_predictions = [];
      let ai_predictionSaved = await ai_prediction.save();

      //oppo AI predictions
      if (json.AI_OPP.data.length > 0) {
        json.AI_OPP.data.forEach(async element => {
          if (element.opp_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : Opportunity ID ${element.opp_id} is Undefined `);
          } else {
            await OpportunityModel.findOneAndUpdate({
              idorigin: element.opp_id
            }, {
              risk: element?.risk,
              estimatedCloseDate: element?.estimatedCloseDate
            });
          }
        })
      }
      logger.info(`Saving ${json.AI_OPP.data.length} new Monthly opportunity predictions works properly `)

      //sync ai_prediction_manager_ai_best_case 
      if (json.manager_AI_Bestcase.length > 0) {
        json.manager_AI_Bestcase.forEach(async element => {
          //console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.manager_AI_Bestcase.length} new Monthly  manager ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_best_case 
      if (json.sales_AI_Bestcase.length > 0) {
        json.sales_AI_Bestcase.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Bestcase_Model();
              newOne.ai_best_case = element.AI_Bestcase;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_best_case: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.sales_AI_Bestcase.length} new Monthly  sales ai bestCase predictions works properly `)

      //sync ai_prediction_sales_ai_commit 
      if (json.sales_AI_Forecast.length > 0) {
        json.sales_AI_Forecast.forEach(async element => {
          //console.log(element.sales_id)
          if (element.sales_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : sales_id  ${element.sales_id} is Undefined `);
          } else {
            let findedSales = await SalesUserModel.findOne({
              idorigin: element.sales_id
            });
            if (findedSales) {
              let newOne = new AI_Prediction_sales_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.sales_id = element.sales_id;
              newOne.salesuser = findedSales._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_sales_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.sales_AI_Forecast.length} new Monthly  sales ai Forecast predictions works properly `)

      //sync ai_prediction_manager_ai_commit 
      if (json.manager_AI_Forecast.length > 0) {
        json.manager_AI_Forecast.forEach(async element => {
          //console.log(element.manager_id)
          if (element.manager_id == "undefined") {
            logger.warn(`YEARLY prediction sync process : manager_id  ${element.manager_id} is Undefined `);
          } else {
            let findedManager = await ManagerUserModel.findOne({
              idorigin: element.manager_id
            });
            if (findedManager) {
              let newOne = new AI_Prediction_manager_AI_Commit_Model();
              newOne.ai_commit = element.AI_Forecast;
              newOne.manager_id = element.manager_id;
              newOne.manageruser = findedManager._id;
              let newOneSaved = await newOne.save();
              if (newOneSaved) {
                await AI_PredictionModel.findOneAndUpdate({
                  _id: ai_predictionSaved._id
                }, {
                  $push: {
                    ai_prediction_manager_ai_commit: newOneSaved._id
                  }
                }, );
              }
            }
          }
        })
      }
      logger.info(`Saving ${json.manager_AI_Forecast.length} new Monthly  manager ai Forecast predictions works properly `)

    };



    res.status(200).json({
      success: true
    });

  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
};


 


exports.getBy = async (req, res) => {
  try {

    var query = {};

    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
      query["type"] = "Yearly"
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
      query["type"] = "Quarterly"
    }

    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
      query["type"] = "Monthly"
    }

    //console.log(query)
    const finded = await AI_PredictionModel.find(query).sort({
      createddate: -1
    }).populate(["ai_prediction_manager_ai_best_case", "ai_prediction_manager_ai_commit", "ai_prediction_sales_ai_best_case", "ai_prediction_sales_ai_commit"]);
    //.populate(["ai_opportunity_predictions"]);
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* 

exports.getByForManager = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const id = req.params.id;
    var query = {};

    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
      query["type"] = "Yearly"
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
      query["type"] = "Quarterly"
    }

    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
      query["type"] = "Monthly"
    }

    //console.log(query)
    const finded = await AI_PredictionModel.find(query).sort({
      createddate: -1
    }).populate(["ai_prediction_manager_ai_best_case", "ai_prediction_manager_ai_commit", "ai_prediction_sales_ai_best_case", "ai_prediction_sales_ai_commit"]); 
    //.populate(["ai_opportunity_predictions"]);
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

 */
exports.getAll = async (req, res) => {
  try {
    //const finded = await AI_PredictionModel.find().sort('-createddate').populate(["ai_opportunity_predictions"]);
    const finded = await AI_PredictionModel.find().sort({
      createddate: -1
    }).populate(["ai_prediction_manager_ai_best_case", "ai_prediction_manager_ai_commit", "ai_prediction_sales_ai_best_case", "ai_prediction_sales_ai_commit"]);

    //.sort({date: -1})
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getById = async (req, res) => {
  try {

    if (req.params.id == "undefined") throw TypeError("ID undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const id = req.params.id;


    const finded = await AI_PredictionModel.findById(id).populate(["ai_prediction_manager_ai_best_case", "ai_prediction_manager_ai_commit", "ai_prediction_sales_ai_best_case", "ai_prediction_sales_ai_commit"]);; //.populate(["ai_opportunity_predictions"]);
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



/* 

exports.create = async (req, res) => {
  try {
  
    if (req.params.id == "undefined") throw TypeError("ID undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    if (req.body == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
    const id = req.params.id;
    const data = req.body;

    const newOne = new AI_PredictionModel(data);
    newOne.opportunity = id; // <=== Assign manageruser id from param  to manageruser key
    newOne.createddate = Date.now(); // <=== Assign manageruser id from param  to manageruser key
    // console.log("newOne " + newOne);

    await newOne.save();
    const relatedOne = await OpportunityModel.findById({
      _id: newOne.opportunity
    })

    relatedOne.ai_predictions.push(newOne);
    await relatedOne.save();
    res.status(200).json({
      success: true,
      data: newOne
    })
  } catch (err) {
    res.status(400).json({
      success: false,
      message: err.message
    })
  }
};
 */


exports.update = async (req, res) => {
  try {



    if (req.params.id == "undefined") throw TypeError("ID undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    if (req.body == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
    const id = req.params.id;
    const data = req.body;
    const edited = await AI_PredictionModel.findByIdAndUpdate(id, data);

    res.status(200).json({
      success: true,
      data: edited
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const deleted = await AI_PredictionModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: deleted
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/*
exports.getAllByOpportunityId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await AI_PredictionModel
      .find({
        opportunity: id
      }).sort('-createddate');
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLastPredictionByOpportunityId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await AI_PredictionModel
      .findOne({
        opportunity: id
      }).sort('-createddate');
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
*/