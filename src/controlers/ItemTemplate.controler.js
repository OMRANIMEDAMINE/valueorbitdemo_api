const logger = require('../../config/logger');
const ItemTemplateModel = require("../models/ItemTemplate.model");
const CategoryTemplateModel = require("../models/CategoryTemplate.model");




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
    const finded = await ItemTemplateModel.find().populate(['optionstemplate']);
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



exports.getByCategoryTemplateId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await ItemTemplateModel
      .find({
        categorytemplate: id
      }).populate(['optionstemplate']);
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
    const finded = await ItemTemplateModel
      .findById(id).populate(['optionstemplate']);
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
    const newOne = new ItemTemplateModel(data);
    newOne.categorytemplate = id; // <=== Assign category template id  
    await newOne.save();

    //Add To Category
    const relatedOne = await CategoryTemplateModel.findById({
      _id: newOne.categorytemplate
    })
    relatedOne.itemstemplate.push(newOne);
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
    const edited = await ItemTemplateModel.findByIdAndUpdate(id, data);

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
    const todeleted = await ItemTemplateModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: todeleted
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
exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const todeleted = await ItemTemplateModel.findByIdAndDelete(id);
    console.log(todeleted._id);
    if (todeleted) {
      if (todeleted.optionstemplate.length == 0) {
        //DELETE FROM Category Template  To Item
       
        await CategoryTemplateModel.findOneAndUpdate({
          _id: todeleted.categorytemplate
        }, {
          $pull: {
            itemstemplate: todeleted._id
          }
        });
     
        //SAVE DELETE
        //todeleted.remove();
          await ItemTemplateModel.findByIdAndDelete(id);


        res.status(200).json({
          success: true,
          data: todeleted
        });
      } else {
        logger.error(error.message)
        res.status(400).json({
          success: false,
          raison: "has relationships !"
        });
      }
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
};*/