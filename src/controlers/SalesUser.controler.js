const logger = require('../../config/logger');
const SalesModel = require("../models/SalesUser.model");
const ManagerUserModel = require("../models/ManagerUser.model");
  
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
    const finded = await SalesModel.find().select('-password');
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


exports.getByManagerId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await SalesModel
      .find({
        manageruser: id
      }).select('-password');
      

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
    const finded = await SalesModel
      .findById(id).select('-password    ').populate(['salesactions']);
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

exports.getByUsernamePassword = async (req, res) => {
  try {
     
    //console.log("password: ");
   
    var isfound = false;

/*     console.log("password: "+ query["password"]);
    console.log("username: "+ query["username"]); */

    const finded = await SalesModel
      .findOne({
        username: req.query.username,
        password: req.query.password
      }).select('-password -opportunities -__v   ');

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
    const newOne = new SalesModel(data);
    //console.log("newOne " + newOne);
    newOne.manageruser = id; // <=== Assign manageruser id from param  to manageruser key
    //console.log("manageruser " + newOne.manageruser);
    await newOne.save();

    const relatedOne = await ManagerUserModel.findById({
      _id: newOne.manageruser
    })

    relatedOne.salesusers.push(newOne);
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
    const edited = await SalesModel.findByIdAndUpdate(id, data);
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
    const todeleted = await SalesModel.findById(id);
    if (todeleted) {
      if (todeleted.opportunities.length == 0) {

        //DELETE  Related one
        const relatedOne = await ManagerUserModel.findById({
          _id: todeleted.manageruser
        })
        relatedOne.salesusers.pull(todeleted);
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
};




exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const todeleted = await SalesModel.findByIdAndDelete(id);
    
   
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