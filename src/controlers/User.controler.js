const logger = require('../../config/logger');
const userModel = require("../models/User.model");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};


exports.getAll = async (req, res) => {
  try {
    const finded = await userModel.find().populate('sales');
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
    const finded = await userModel
      .findById(id);
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


exports.getByUsernamePassword = async (req, res) => {
  try {
     
    //console.log("password: ");
   
    var isfound = false;
 
    const finded = await userModel
      .findOne({
        username: req.query.username,
        password: req.query.password
      }).select('-password -opportunities -__v  ');

    if (finded){    isfound = true;}
    res.status(200).json({
      success: true,
      isfound: isfound,
      data: finded
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      isfound: false,
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
    const newOne = new userModel(data);
    const saved = await newOne.save();

    res.status(200).json({
      success: true,
      data: saved
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
  const {
    id
  } = req.params;
  try {
    //console.log("Valid Id Param " + id);
    const edited = await userModel.findByIdAndUpdate(id, data);

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
  try {
    const todeleted = await userModel.findByIdAndDelete(id);

    res.status(200).json({
      success: false,
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


exports.deleteAll = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const todeleted = await userModel.deleteMany();

    res.status(200).json({
      success: false,
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