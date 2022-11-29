const logger = require('../../config/logger');
const conditionBuilderModel = require("../models/ConditionBuilder.model");

var _ = require("lodash");



exports.getAll = async (req, res) => {
  try {

    const finded = await conditionBuilderModel.find();
    if (!finded) throw TypeError("no data found");

   let datas = [];
    finded.forEach(condition => { 
      let data = {
        "_id": condition._id,
        "owneridorigin": condition.owneridorigin,
        "name": condition.name,
        "context": condition.context,
        "conditions": condition.conditions,
        "actions": [...condition.actions.actions, ...condition.actions.signals, ...condition.actions.guidances],
      };

      datas.push(data)
      
    }); 
     



    //console.log(data);
    res.status(200).json({
      success: true,
      data: datas
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



exports.getAllAppStyle = async (req, res) => {
  try {
    const finded = await conditionBuilderModel.find();
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



exports.getAllByOwnerIdOrigin = async (req, res) => {
  try {
    const {
      id
    } = req.params;
    if (id == "undefined") throw TypeError("ID Rules undefined");
    const finded = await conditionBuilderModel.find({
      owneridorigin: id
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
    const finded = await conditionBuilderModel.findById(id);
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

    // if (!ObjectID.isValid(req.params.id)) throw TypeError("ID conditionbuilder not valid : " + req.params.id);
    if (data == "undefined") throw TypeError("Request body undefined");
    if (Object.keys(data).length === 0) throw TypeError("Empty body");
    if (data.owneridorigin == "undefined") throw TypeError("owneridorigin undefined");

    const newOne = new conditionBuilderModel(data);
    newOne.createddate = Date.now();
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
  try {
    const data = req.body;
    const {
      id
    } = req.params;


    const toUpdate = await conditionBuilderModel.findById(id);
    if (!toUpdate) throw TypeError(`This Condition Builder with ${id} not found`);

    const edited = await conditionBuilderModel.findByIdAndUpdate(id, data);

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
    const todelete = await conditionBuilderModel.findById(id);
    if (!todelete) throw TypeError(`This Condition Builder with ${id} not found`);

    /* 
        //Delete all related ActionsBuilder
        if(todelete.actionbuilder.length > 0) {
          todelete.actionbuilder.forEach(async (actb) => { 
            console.log(`deleted related actionBuilder with ID  ${actb._id} `);
            await actionBuilderModel.findByIdAndDelete(actb._id);        
          });
        }
        

        //Delete all related SignalsBuilder
        if(todelete.signalbuilder.length > 0) {
          todelete.signalbuilder.forEach(async (sigb) => { 
            console.log(`deleted related signalBuilder with ID  ${sigb._id} `);
            await signalBuilderModel.findByIdAndDelete(sigb._id);        
          });
        } */



    const deleted = await conditionBuilderModel.findByIdAndDelete(id);
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