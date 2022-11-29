const FiscalYearModel = require("../models/FiscalYearSetting.model");
const logger = require('../../config/logger');


const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};


exports.getFiscalYearSetting= async (req, res) => {
  try {
    //const data = await FiscalYearModel.find().sort({ field: 'asc', _id: -1 }).limit(1);     
    const data = await FiscalYearModel.findOne().sort({
      _id: -1
    });
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAll = async (req, res) => {
  try {
    const data = await FiscalYearModel.find();
     
    res.status(200).json({
      success: true,
      data: data
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
    const edited = await FiscalYearModel.findByIdAndUpdate(req.params.id
    , {
      ...req.body, 
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


exports.create = async (req, res) => {
  //data validator
  verifyData(res, req.body);

  const newFiscalYear= new FiscalYearModel({
    ...req.body,
    createddate: Date.now(),
    lastmodifieddate: Date.now()
  });
  try {
    const saved = await newFiscalYear.save();
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

exports.delete = async (req, res) => {
  try {
    const deleted = await FiscalYearModel.findByIdAndDelete(req.params.id);
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