const logger = require('../../config/logger');
const variableTypeBuilderModel = require("../models/VariableTypeBuilder.model");
const  variableTypeInputBuilderModel = require("../models/VariableTypeInputBuilder.model");
 var _ = require("lodash");



exports.getAll = async (req, res) => {
  try {
    const finded = await variableTypeInputBuilderModel.find();
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
    const finded = await variableTypeInputBuilderModel.findById(id);
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
 
   // console.log("hii")
    const data = req.body;
    const id= req.params.id
    console.log(id)

    if (data == "undefined") throw TypeError("Request body undefined");
    if (id == "undefined") throw TypeError("ID undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");


    const relatedVariableTypeBuilder = await variableTypeBuilderModel.findById(id);
    console.log(relatedVariableTypeBuilder)
    if (!relatedVariableTypeBuilder) throw TypeError("VariableTypeBuilder Not Found");
   
    //ActionBuilder Creation and Saving ..
    const newOne = new variableTypeInputBuilderModel(data);
    newOne.variabletypebuilder = relatedVariableTypeBuilder._id ;
    const newOneSaved = await newOne.save();
      

    await variableTypeBuilderModel.findOneAndUpdate({
      _id: req.params.id
    }, {
      $push: {
        variabletypeinputbuilder: newOneSaved._id
      }
    }, );  


 
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
    const edited = await variableTypeInputBuilderModel.findByIdAndUpdate(id, data);

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

    const deleted = await variableTypeInputBuilderModel.findByIdAndDelete(id);
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