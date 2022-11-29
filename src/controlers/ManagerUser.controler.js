const logger = require('../../config/logger');
const ManagerUserModel = require("../models/ManagerUser.model");
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");
const SalesModel = require("../models/SalesUser.model");
const OpportunityModel = require("../models/Opportunity.model");

const mongoose = require("mongoose");
var ObjectId = require('mongoose').Types.ObjectId;

var _ = require("lodash");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};


exports.getAll = async (req, res) => {
  try {
    const data = await ManagerUserModel
      .find().select('-__v -password')
      .populate(
        [
          {
            path: 'salesusers',
            select: 'opportunities firstname lastname username salesactions',
            populate: {
              path: 'opportunities',
              select: 'dealprogress dealcoaching ',
            }
          }
        ]);
    res.status(200).json(data);
  } catch (error) {
 logger.error(error.message);
    res.status(400).json(error);
  }
};


exports.getById = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await ManagerUserModel
      .findById(id).select('-__v -password -manageractionshistory')
      .populate(
        [
          {
            path: 'salesusers',
            select: 'opportunities firstname lastname username',
            populate: {
              path: 'opportunities',
              select: 'dealprogress dealcoaching ',
            }
          },
          'manageractions'
        ]);
    let sales_tab_coaching = [];
    let sales_tab_progress = [];
    let sales_tabID = [];

    let Sumtotalprogress;
    let totalProgress;
    let totalProgressPercentage;


    let Sumtotalcoaching;
    let totalcoaching;
    let totalcoachingPercentage;

    //console.log(sales.opportunities);
    if (finded) {
      if (finded.salesusers.length != 0) {

        finded.salesusers.forEach(sales => {
          let tab_coaching = [];
          let tab_progress = [];
          sales_tabID.push(sales.id);
          if (sales.opportunities.length != 0) {
            sales.opportunities.forEach(oppo => {
              //console.log("oppo.dealprogress "+ oppo.dealprogress);
              // console.log("oppo.dealprogress "+ oppo.dealcoaching);
              tab_progress.push(oppo.dealprogress);
              tab_coaching.push(oppo.dealcoaching);
            });
          }

          /*  console.log("tab_progress " + tab_progress);
           Sumtotalprogress = tab_coaching.reduce((a, b) => a + b, 0);
           totalProgress = (Sumtotalprogress / tab_coaching.length) * 100;
           totalProgressPercentage = Math.round((totalProgress + Number.EPSILON) * 100) / 100; */
          sales_tab_progress.push(tab_progress);


          /*  console.log("tab_coaching " + tab_coaching);
           
           Sumtotalcoaching = tab_progress.reduce((a, b) => a + b, 0);
           console.log("Sumtotalcoaching " + Sumtotalcoaching);
           totalcoaching = (Sumtotalcoaching / tab_progress.length) * 100;
           console.log("totalcoaching " + totalcoaching);
           //totalcoachingPercentage = Math.round((totalcoaching + Number.EPSILON) * 100) / 100;
           console.log("totalcoachingPercentage " + totalcoachingPercentage); */
          sales_tab_coaching.push(tab_coaching);

        });
      }
    }


    res.status(200).json({
      success: true,
      data: finded,
      sales_tab_coaching: sales_tab_coaching,
      sales_tab_progress: sales_tab_progress,
      sales_tabID: sales_tabID
    });
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getByOriginId = async (req, res) => {

  const {
    id
  } = req.params;
  try {
    const finded = await ManagerUserModel.findOne({
      idorigin: id
    })

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

    const finded = await ManagerUserModel
      .findOne({
        username: req.query.username,
        password: req.query.password
      }).select('-password -opportunities -__v -processflowtemplate')
      .populate([{
        path: 'salesusers',
        select: ('id idorigin username firstname lastname ')
      }])

    if (finded) {
      isfound = true;
    }
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
    const newOne = new ManagerUserModel(data);
    //console.log("newOne " + newOne);
    newOne.processflowtemplate = id; // <=== Assign manageruser id from param  to manageruser key
    //console.log("processflowtemplate " + newOne.processflowtemplate);
    await newOne.save();

    const relatedOne = await ProcessFlowTemplateModel.findById({
      _id: newOne.processflowtemplate
    });

    if (relatedOne) {
      relatedOne.managerusers.push(newOne);
      await relatedOne.save();
    }
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
  const {
    id
  } = req.params;
  try {
    //console.log("Valid Id Param " + id);
    const edited = await ManagerUserModel.findByIdAndUpdate(id, data);

  
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
    const todeleted = await ManagerUserModel.findById(id);
    if (todeleted) {
      if (todeleted.salesusers.length == 0) {

        //DELETE FROM ProcessFlow Template   
        const relatedOne = await ProcessFlowTemplateModel.findById({
          _id: todeleted.processflowtemplate
        })
        relatedOne.managerusers.pull(todeleted);
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

/*  

exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const todeleted = await ManagerUserModel.findById(id);
    if (todeleted) {
      if (todeleted.salesusers.length == 0) {

        //DELETE FROM ProcessFlow Template  To Item
        const relatedOne = await ProcessFlowTemplateModel.findById({
          _id: todeleted.processflowtemplate
        })
        relatedOne.managerusers.pull(todeleted);
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
}; */