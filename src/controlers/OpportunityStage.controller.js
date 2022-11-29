const logger = require('../../config/logger');
const OpportunityStageModel = require("../models/OpportunityStage.model");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};


exports.getAll = async (req, res) => {
  try {//sortorder: { $ne: null },
    const data = await OpportunityStageModel.find({ isactive: { $eq: true } }).sort({
      'sortorder': 1
    });
    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.getAllNames = async (req, res) => {
  try {//sortorder: { $ne: null },
    const data = await OpportunityStageModel.find({ isactive: { $eq: true } }, 'apiname defaultprobability -_id ') 
    .sort({
      'sortorder': 1
    });
  
    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.getById = async (req, res) => {
  try {
    const data = await OpportunityStageModel.findById(req.params.id); //.populate([ "opportunities"]);
     

    //          options: { sort: { last_modified: "ascending" } },

    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.create = async (req, res) => {
  //data validator
  verifyData(res, req.body);

  const newAccount = new OpportunityStageModel({ ...req.body });
  try {
    const saved = await newAccount.save();
    res.status(201).json(saved);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.update = async (req, res) => {
  verifyData(res, req.body);

  try {
    const edited = await OpportunityStageModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      last_modified: Date.now(),
    });
    res.status(200).json(edited);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await OpportunityStageModel.findByIdAndDelete(req.params.id);
    res.status(200).json(deleted);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};
