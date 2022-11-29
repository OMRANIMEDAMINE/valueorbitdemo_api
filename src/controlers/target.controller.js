const logger = require('../../config/logger');
//const ObjectID = require('mongoose').Types.ObjectId;


const targetModel = require("../models/Target.model"); 
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
 
 
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
    
    /* const data = await targetModel.find().sort({
      createddate: 1
    }) */
    const data = await targetModel.find().sort({ field: 'asc', _id: -1 });
    
    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await targetModel.findById(req.params.id);

    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

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

   
   /*  const finded = await targetModel.find(query).sort({
      createddate: 1
    })
 */
    const finded = await targetModel.find(query).sort({ field: 'asc', _id: -1 });

    let repsSalesTarget = [] 
    const relatedManager = await ManagerModel.findById(req.query.createdbyid);
    if (relatedManager) {
          // REPS COMMIT / BEST CASE AND QUOTA FOR the SALES OF this MANAGER
      for (let sales of relatedManager.salesusers) {
        // RELATED SALES
        let relatedSales = await SalesModel.findById(sales);
        if (relatedSales) {
          query["createdbyid"] = relatedSales.id ;
          // GET Forecast
          const findedTargetSales = await targetModel.find(query).sort({ field: 'asc', _id: -1 });//.limit(1);

          if (findedTargetSales) {
            repsSalesTarget.push(findedTargetSales)
          } else {
            repsSalesTarget.push(null)
          }
        }
      }
    }



    res.status(200).json({
      success: true,
      data: finded,
      repsSalesTarget: repsSalesTarget
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
   /*  if (!req.params.id) throw TypeError("ID not exist : " + req.params.id);

    const manager  = await ManagerModel.findById(req.params.id);   
    if (!manager) throw TypeError(`User with ID : ${req.params.id} not found !`); */

    let newForecast = new targetModel({
      ...req.body,       
      createddate: Date.now(),
      lastmodifieddate: Date.now(),
/*       createdbyid: manager._id,
      lastmodifiedbyid:  manager._id, */
    });
  
    const saved  = await newForecast.save();   
   

    res.status(200).json({
      success: true, 
        data: saved
    });

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  verifyData(res, req.body);
  try {
    const edited = await targetModel.findByIdAndUpdate(req.params.id , {
      ...req.body,
      lastmodifieddate: Date.now(),
    });

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

/* 

exports.createCommitForSales = async (req, res) => {
  try {  
    if (!req.params.id) throw TypeError("ID not exist : " + req.params.id);

    const sales  = await SalesModel.findById(req.params.id);   
    if (!sales) throw TypeError(`User with ID : ${req.params.id} not found !`);

    let newForecast = new targetModel({
      ...req.body,  
      createddate: Date.now(),
      lastmodifieddate: Date.now(),
      createdbyid: sales._id,
      lastmodifiedbyid:  sales._id,
    });
  
    const saved  = await newForecast.save();   

    res.status(200).json({
      success: true, 
        data: saved
    });

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; */

exports.delete = async (req, res) => {
  try {
    const deleted = await targetModel.findByIdAndDelete(req.params.id);
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
 
