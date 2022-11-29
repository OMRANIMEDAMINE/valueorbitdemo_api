const logger = require('../../config/logger');
const ProcessFlowModel = require("../models/ProcessFlow.model");
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");
const OpportunityModel = require("../models/Opportunity.model");
const ItemModel = require("../models/Item.model");
const CategoryModel = require("../models/Category.model");
const ManagerModel = require("../models/ManagerUser.model");
const OptionModel = require("../models/Option.model");



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
    const finded = await ProcessFlowModel
      .find()
      .populate([{
        path: 'categories',
        populate: {
          path: 'items',
          populate: {
            path: 'options'
          }
        }
      }]);

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

exports.getProgressDealByProcessFlowId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
 
    const finded = await ProcessFlowModel
      .findById(id)
      .populate([{
        path: 'categories',
        populate: {
          path: 'items',
        }
      }]);

   // console.log(finded);
    var totalcategories = finded.categories.length;
    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];


    for (let category of finded.categories) {
      tab_totalitems.push(category.items.length);
      var coaching = 0;
      var completed = 0;
      for (let item of category.items) {
        //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
        if (item.isopinongived == true) {
          coaching++;
        }
        if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
          completed++;
        }

      }
      tab_coaching.push(coaching);
      tab_completed.push(completed);

    } 


    res.status(200).json({
      success: true,
      totalcategories,
      tab_totalitems,
      tab_coaching,
      tab_completed
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
    const finded = await ProcessFlowModel
      .findById(id)
      .select('-createddate -__v')
      .populate([{
        path: 'categories',
        select: '-createddate -__v',
        populate: {
          path: 'items',
          select: '-createddate -itemupdates -__v -messages',
          populate: {
            path: 'options',
            select: '-createddate -__v',
          }

        }
      }]);

   // console.log(finded);
    var totalcategories = finded.categories.length;
    var tab_totalitems = [];
    var tab_coaching = [];
    var tab_completed = [];

    for (let category of finded.categories) {
      tab_totalitems.push(category.items.length);
      var coaching = 0;
      var completed = 0;
      for (let item of category.items) {
        //if ((discussion.isopinongived == true) && (discussion.manageropinion == 2)) {completed = completed + 1;}
        if (item.isopinongived == true) {
          coaching++;
        }
        if ((item.issalesfeelgived == true) && (item.salesfeel == 2)) {
          completed++;
        }
      }
      tab_coaching.push(coaching);
      tab_completed.push(completed);

    }


    res.status(200).json({
      success: true,
      data: finded,
      totalcategories,
      tab_totalitems,
      tab_coaching,
      tab_completed
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/* .find({
        managerusers: {
          $elemMatch: {
            _id: id
          }
        }
      }) */



 

exports.create = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    //validate data as required
    verifyData(res, req.body);
    const newOne = new ProcessFlowModel(data);
    //newOne.oppotunity = id; // <=== Assign oppotunity id  
    await newOne.save();

    /*     //Add To 
        const relatedopportunity = await opportunityModel.findById({
          _id: newOne.oppotunity
        })
        opportunity.processflow = (newOne);
        await relatedopportunity.save(); */

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



exports.createBasedOnManagerID = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;

    // Related Manager 
    const relatedManager = await ManagerModel.findById(id).select('-_id -__v -managerusers')
      .populate(
        [{
          path: 'processflowtemplate',
          select: '-_id -__v -managerusers',
          populate: {
            path: 'categoriestemplate',
            select: '-_id -__v -processflowtemplate',
            populate: {
              path: 'itemstemplate',
              select: '-_id -__v -categoriestemplate',
              populate: {
                path: 'optionstemplate',
                select: '-_id -__v -itemtemplate',
              }
            }
          }
        }]);

    var duplicate = new ProcessFlowModel();
    for (let category of relatedManager.processflowtemplate.categoriestemplate) {
      var cat = new CategoryModel();
      cat.name = category.name;
      cat.description = category.description;
      cat.items = [];
      for (let item of category.itemstemplate) {
        var itm = new ItemModel();
        itm.name = item.name;
        itm.description = item.description;
        itm.options = [];
        for (let option of item.optionstemplate) {
          var op = new OptionModel();
          op.name = option.name;
          itm.options.push(op);
        }
        cat.items.push(itm);
      }
      duplicate.categories.push(cat);
    }

    //console.log(duplicate);


    await duplicate.save();

    res.status(200).json({
      success: true,
      data: duplicate
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
  const {
    id
  } = req.params;
  try {
    const edited = await ProcessFlowModel.findByIdAndUpdate(id, data);
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
    const deleted = await ProcessFlowModel.findByIdAndDelete(id);
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