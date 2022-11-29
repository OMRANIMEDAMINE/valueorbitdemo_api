const logger = require('../../config/logger');
const actionBuilderModel = require("../models/ActionBuilder.model");
const actionParamsBuilderModel = require("../models/ActionParamsBuilder.model");

 var _ = require("lodash");



exports.getAll = async (req, res) => {
  try {
    const finded = await actionParamsBuilderModel.find();
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
    const finded = await actionParamsBuilderModel.findById(id);
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
    if (req.params.id == "undefined") throw TypeError("ID Actionbuilder undefined");
   // if (!ObjectID.isValid(req.params.id)) throw TypeError("ID Actionbuilder not valid : " + req.params.id);
    if (data == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
  
    const relatedOne = await actionBuilderModel.findById(req.params.id);
    if (!relatedOne) throw TypeError(`Related action builder with ID ${req.params.id} is not found `);
   
    //ActionParamsBuilder Creation
    const newOne = new actionParamsBuilderModel(data);
    //newOne.actionbuilder = req.params.id; // <=== Assign category template id  
    const newOneSaved = await newOne.save();

    // Related  actionbuilder push
    await actionBuilderModel.findByIdAndUpdate(req.params.id, {
      $push: {
        actionparamsbuilder: newOneSaved._id
      },
    });

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
    const edited = await actionParamsBuilderModel.findByIdAndUpdate(id, data);
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

    const deleted = await actionParamsBuilderModel.findByIdAndDelete(id);
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