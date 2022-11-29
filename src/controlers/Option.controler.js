const logger = require('../../config/logger');
const OptionModel = require("../models/Option.model");
const ItemModel = require("../models/Item.model");




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
    const finded = await OptionModel.find();

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


exports.getByItemId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await OptionModel
      .find({
        item: id
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

exports.getById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await OptionModel
      .findById(id);
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
    const {
      id
    } = req.params;



    //validate data as required
    verifyData(res, req.body);
    const newOne = new OptionModel(data);
    newOne.item = id; // <=== Assign  id  

    await newOne.save();

    //Add To Item
    const relatedOne = await ItemModel.findById({
      _id: newOne.item
    })
    relatedOne.options.push(newOne);
    await relatedOne.save();

    res.status(200).json({
      success: true,
      data: newOne
    })


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.update = async (req, res) => {
  //data validator
  verifyData(res, req.body);
  const data = req.body;
  //console.log("data " + data);
  const {
    id
  } = req.params;
  //console.log("id " + id);

  try {
    //console.log("Valid Id Param " + id);
    const edited = await OptionModel.findByIdAndUpdate(id, data);

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
    const todeleted = await OptionModel.findById(id);
    if (todeleted) {
      todeleted.remove();
      res.status(200).json({
        success: true,
        data: todeleted
      });
    } else {
      res.status(200).json({
        success: false,
        data: todeleted
      });
    }

  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};