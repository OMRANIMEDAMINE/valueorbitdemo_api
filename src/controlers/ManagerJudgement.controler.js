const logger = require('../../config/logger');
const ManagerJudgementModel = require("../models/ManagerJudgement.model");
 
const mongoose = require("mongoose");

var _ = require("lodash");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};
 

exports.getAll = async (req, res) => {
  try {
    const finded = await ManagerJudgementModel.find();
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
  const {
    id
  } = req.params;
  try {
    const finded = await ManagerJudgementModel.findById(id) ;
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
    const data = req.body;

    //validate data as required
    verifyData(res, req.body);

    const newOne = new ManagerJudgementModel(data); 
    await newOne.save();
     
    res.status(200).json({
      success: true,
      data: newOne
    })
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    })
  }
};
 
exports.update = async (req, res) => {
  //data validator
  verifyData(res, req.body);
  const data = req.body;
  const {
    id
  } = req.params;
  try {
    const edited = await ManagerJudgementModel.findByIdAndUpdate(id, data);

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
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const deleted = await ManagerJudgementModel.findByIdAndDelete(id);
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