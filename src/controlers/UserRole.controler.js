const logger = require('../../config/logger');
const userRoleModel = require("../models/User.model");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};

exports.getAll = async (req, res) => {
  try {
    const finded = await userRoleModel.find();
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
    const finded = await userRoleModel
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


exports.create = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    //validate data as required
    verifyData(res, req.body);
    const newOne = new userRoleModel(data);
    const saved = await newOne.save();

    res.status(200).json({
      success: true,
      data: saved
    })

  } catch (err) {
        console.log(err)
    res.status(400).json({
      success: false,
      message: err.message
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
    const edited = await userRoleModel.findByIdAndUpdate(id, data);

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
    const todeleted = await userRoleModel.findByIdAndDelete(id);

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
    const todeleted = await userRoleModel.deleteMany();

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