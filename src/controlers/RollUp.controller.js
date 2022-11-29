const logger = require('../../config/logger');
const SalesUserModel = require("../models/SalesUser.model");
const OpportunityModel = require("../models/Opportunity.model");
const RollUpModel = require("../models/RollUp.model");
const ObjectID = require('mongoose').Types.ObjectId;

let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}
const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};


exports.getAll = async (req, res) => {
  try {
    //const finded = await AI_PredictionModel.find().sort('-createddate').populate(["ai_opportunity_predictions"]);
    const finded = await RollUpModel.find().sort({
      createddate: -1
    })

    //.sort({date: -1})
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};





exports.getBySalesIdFiltered = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID sales undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    var query = {};
    query["sales"] = req.params.id

    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }
    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
    }


    //const finded = await AI_PredictionModel.find().sort('-createddate').populate(["ai_opportunity_predictions"]);
    const finded = await RollUpModel.find(query).sort({
      createddate: -1
    })

    //.sort({date: -1})
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};





exports.getById = async (req, res) => {
  try {

    if (req.params.id == "undefined") throw TypeError("ID RollUp undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID Rollup not valid : " + req.params.id);
    const id = req.params.id;


    const finded = await RollUpModel.findById(id);
    //.populate(["ai_opportunity_predictions"]);
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};




exports.create = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID sales undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    if (req.body == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
    const id = req.params.id;
    const data = req.body;
    const newOne = new RollUpModel(data);
    newOne.sales = id;
    newOne.createddate = Date.now();

    /*     await newOne.save();
        const relatedOne = await SalesUserModel.findById({
          _id: newOne.sales
        })

        relatedOne.ai_predictions.push(newOne);
        await relatedOne.save();
        res.status(200).json({
          success: true,
          data: newOne
        }) */

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
};


exports.load = async (req, res) => {
  try {
    console.log("Starting prediction process . . .");
    var current_date = moment((new Date()), "DD.MM.YYYY");   
    const current_fiscal_year = current_date.year();   
    //const current_fiscal_quarter = start_date.quarter();
    const current_fiscal_month = current_date.month() + 1;
    console.log("current_fiscal_year " + current_fiscal_year);
    //console.log("current_fiscal_quarter " + current_fiscal_quarter);
    console.log("current_fiscal_month " + current_fiscal_month);

    const Sales = await SalesUserModel.find();
    if (Sales) {
      Sales.forEach(async (sale) => {
        console.log("SALES ID:" + sale._id);

        let findedOppos = await OpportunityModel
          .find({
            salesuser: sale._id
          }).select(' id  fiscalyear closedate forecastcategoryname  amount ');

        let FiltredOppos = findedOppos.filter((item) => {
          if (
            parseInt(item?.fiscalyear) !== parseInt(current_fiscal_year)
          ) {
            return false;
          }
          /* if (
            parseInt(item?.fiscalquarter) !== parseInt(current_fiscal_quarter)
          ) {
            return false;
          } */
          if (
            parseInt(moment(item?.closedate).month() + 1) !== parseInt(current_fiscal_month)
          ) {
            return false;
          }
          return true;
        })


        const total_amount_Best_Case = FiltredOppos.filter(
          ({
            forecastcategoryname
          }) => forecastcategoryname === "Best Case"
        ).reduce((sum, row) => sum + row.amount, 0);

        const total_amount_Closed = FiltredOppos.filter(
          ({
            forecastcategoryname
          }) => forecastcategoryname === "Closed"
        ).reduce((sum, row) => sum + row.amount, 0);

        const total_number_Commit = FiltredOppos.filter(
            ({
              forecastcategoryname
            }) => forecastcategoryname === "Commit")
          .reduce((sum, row) => sum + row.amount, 0);

        const newOne = new RollUpModel();
        newOne.sales = sale._id;
        newOne.createddate = Date.now();
        newOne.fiscalyear = current_fiscal_year;
       // newOne.fiscalquarter = current_fiscal_quarter;
        newOne.fiscalmonth = current_fiscal_month;
        newOne.commit = total_amount_Closed + total_number_Commit;
        newOne.best_case = total_amount_Best_Case + total_amount_Closed + total_number_Commit;
        let newRollUp = await newOne.save();
        //console.log("newRollUp");
        //console.log(newRollUp);

      });
    }

    res.status(200).json({
      success: true
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
};


exports.update = async (req, res) => {
  try {

    if (req.params.id == "undefined") throw TypeError("ID RollUp undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID RollUp not valid : " + req.params.id);
    if (req.body == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
    const id = req.params.id;
    const data = req.body;
    const edited = await RollUpModel.findByIdAndUpdate(req.params.id, data);

    res.status(200).json({
      success: true,
      data: edited
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.delete = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const deleted = await RollUpModel.findByIdAndDelete(req.params.id);
    res.status(200).json({
      success: true,
      data: deleted
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllBySalesId = async (req, res) => {

  try {
    if (req.params.id == "undefined") throw TypeError("ID sales undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const finded = await RollUpModel
      .find({
        sales: req.params.id
      }).sort({
        createddate: -1
      });
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getLastRollUpBySalesId = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("ID sales undefined");
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const finded = await RollUpModel
      .findOne({
        sales: req.params.id
      }).sort({
        createddate: -1
      });
    res.status(200).json({
      success: true,
      data: finded
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

 