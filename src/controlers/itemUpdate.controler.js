const logger = require('../../config/logger');
const ItemUpdateModel = require("../models/ItemUpdate.model");
const ItemModel = require("../models/Item.model");
const OpportunityModel = require("../models/Opportunity.model");


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
    const finded = await ItemUpdateModel.find()
      .sort('-createddate');

 

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
    const finded = await ItemUpdateModel
      .findById(id);//.populate('item');

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
    const finded = await ItemUpdateModel.find({
        item: id
      })
      .sort('-createddate');

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

 
exports.getByOppoId = async (req, res) => {
  try {
    const {
      id
    } = req.params;

    const finded = await ItemUpdateModel.find({
      opportunity: id
    }).sort('-createddate');


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
    //const { id } = req.params;
    var query = {};

    if (req.query.item_id) {
      query["item_id"] = req.query.item_id;
    }

    if (req.query.opportunity_id) {
      query["opportunity_id"] = req.query.opportunity_id;
    }
    //validate data as required
    verifyData(res, req.body);
    const newOne = new ItemUpdateModel(data);

    newOne.item = query["item_id"]; // <=== Assign  item id  
    newOne.opportunity = query["opportunity_id"]; // <=== Assign  opportunity id 


    await newOne.save();

    const relatedItem = await ItemModel.findById({
      _id: newOne.item
    })
    relatedItem.messages.push(newOne);

   
    await relatedItem.save();

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
  //console.log("data " + data);
  const {
    id
  } = req.params;
  //console.log("id " + id);

  try {
    //console.log("Valid Id Param " + id);
    const edited = await DiscussionModel.findByIdAndUpdate(id, data);

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
    const deleted = await ItemUpdateModel.findByIdAndDelete(id);
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