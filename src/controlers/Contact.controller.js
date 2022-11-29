const logger = require('../../config/logger');
const contactModel = require("../models/contact.model");
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
 const ObjectID = require('mongoose').Types.ObjectId;

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204);
    return;
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await contactModel.find();
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllNames = async (req, res) => {
  try {
    const data = await contactModel.find().select('_id name');
    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllNamesBySalesID = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await SalesModel
      .findById(id).select('_id idorigin');

    //console.log(finded.idorigin)

    let data = []
    if (finded) {
      data = await contactModel.find({
        ownerid: finded.idorigin

      }).select('_id ownerid name');

    }

    res.status(200).json({
      success: true,
      data: data
    });


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};




exports.getAllNamesByAccountID = async (req, res) => {
 
  try {
    if (req.params.id == "undefined") throw TypeError("account id undefined");

    const contactsfinded = await contactModel.find(
      {
        "accountid": {
          $eq: req.params.id
        }
      }).select('_id name');

 

    res.status(200).json({
      success: true,
      data: contactsfinded
    });


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.getAllNamesByManagerID = async (req, res) => {

  const {
    id
  } = req.params;
  try {
    const finded = await ManagerModel
      .findById(id).select('_id idorigin salesusers').populate(['salesusers']);

    var data = []
    if (finded) {
      if (finded.salesusers.length != 0) {

        for (let sales of finded.salesusers) {
          let contactsfinded = await contactModel.find({
            ownerid: sales.idorigin
          }).select('_id ownerid name');

          if (contactsfinded.length != 0) {
            for (let element of contactsfinded) {
              //console.log(element)
              data.push(element)
            };
          }
        };
      }
    }

    res.status(200).json({
      success: true,
      data: data
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
  try {
    const data = await contactModel.findById(req.params.id); //.populate([ "opportunities"]);


    //          options: { sort: { last_modified: "ascending" } },

    res.status(200).json({
      success: true,
      data: data
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
  //data validator
  verifyData(res, req.body);

  const newAccount = new contactModel({
    ...req.body
  });
  try {
    const saved = await newAccount.save();
    res.status(200).json({
      success: true,
      data: saved
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.update = async (req, res) => {
  verifyData(res, req.body);

  try {
    const edited = await contactModel.findByIdAndUpdate(req.params.id, {
      ...req.body,
      last_modified: Date.now(),
    });
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
  try {
    const deleted = await contactModel.findByIdAndDelete(req.params.id);
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