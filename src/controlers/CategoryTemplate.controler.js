const logger = require('../../config/logger');
const CategoryTemplateModel = require("../models/CategoryTemplate.model");
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");
const ItemTemplate = require("../models/ItemTemplate.model");

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
    const finded = await CategoryTemplateModel.find()
      .populate({
        path: 'itemstemplate',
        populate: ['optionstemplate']
      });
    res.status(200).json({
      success: true,
      data: finded
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getByProcessFlowTemplateId = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    const finded = await CategoryTemplateModel
      .find({
        processflowtemplate: id
      })
      .populate({
        path: 'itemstemplate',
        populate: ['optionstemplate']
      });

    res.status(200).json({
      success: true,
      data: finded
    })
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
    const finded = await CategoryTemplateModel.findById(id).populate({
      path: 'itemstemplate',
      populate: ['optionstemplate']
    });

    res.status(200).json({
      success: true,
      data: finded
    })
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
    const newOne = new CategoryTemplateModel(data);
    //console.log("newOne " + newOne);
    newOne.processflowtemplate = id; // <=== Assign processflowtemplate id from param  to categoryTemplate key
    await newOne.save();

    const relatedOne = await ProcessFlowTemplateModel.findById({
      _id: newOne.processflowtemplate
    })

    relatedOne.categoriestemplate.push(newOne);
    await relatedOne.save();
    res.status(200).json({
      success: true,
      data: newOne
    })

    // N.B UPDATE CATEGORY ecraser --> ADD $push

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
    //console.log("Valid Id Param " + id);
    const edited = await CategoryTemplateModel.findByIdAndUpdate(id, data);

    // console.log("inValid Id Param " + id);
    res.status(200).json({
      success: true,
      data: edited
    })
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
    const todeleted = await CategoryTemplateModel.findByIdAndDelete(id);
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
    const todeleted = await CategoryTemplateModel.findById(id);
    if (todeleted) {
      if (todeleted.itemstemplate.length == 0) {

        //DELETE FROM ProcessFlow Template  To Item
        const relatedOne = await ProcessFlowTemplateModel.findById({
          _id: todeleted.processflowtemplate
        })
        relatedOne.categoriestemplate.pull(todeleted);
        await relatedOne.save();

        //SAVE DELETE
        todeleted.remove();

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