const logger = require('../../config/logger');
const variableBuilderModel = require("../models/VariableBuilder.model");
var _ = require("lodash");



exports.getAll = async (req, res) => {
  try {
    const finded = await variableBuilderModel.find()
    .populate([{
      path: "variabletypebuilder", 
      populate: {
        path: 'variabletypeinputbuilder',
      }
    }]);

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
    const finded = await variableBuilderModel.findById(id);
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

    const newOne = new variableBuilderModel(data); 
    /*newOne.createddate = Date.now() ;
    newOne.lastmodifieddate = Date.now() ;*/
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
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    if (id== "undefined") throw TypeError("ID  undefined");
    if (data == "undefined") throw TypeError("Request body undefined");
    //data.lastmodifieddate = Date.now() ;
    const edited = await variableBuilderModel.findByIdAndUpdate(id, data);

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

    const deleted = await variableBuilderModel.findByIdAndDelete(id);
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