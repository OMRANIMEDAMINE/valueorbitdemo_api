const actionBuilderModel = require("../models/ActionBuilder.model");
const logger = require('../../config/logger');
const conditionBuilderModel = require("../models/ConditionBuilder.model");
var _ = require("lodash");



exports.getAll = async (req, res) => {
  try {
    const finded = await actionBuilderModel.find().populate('actionparamsbuilder');
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
    const finded = await actionBuilderModel.findById(id).populate('actionparamsbuilder');
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
  
    if (data == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
  
       //ActionBuilder Creation
    const newOne = new actionBuilderModel(data);   
    const newOneSaved = await newOne.save();
    
    res.status(200).json({
      success: true,
      data: newOneSaved
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
  const data = req.body;
  const {
    id
  } = req.params;
  try {
    const edited = await actionBuilderModel.findByIdAndUpdate(id, data);

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
  try {

    const deleted = await actionBuilderModel.findByIdAndDelete(id);
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