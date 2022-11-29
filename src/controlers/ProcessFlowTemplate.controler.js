const logger = require('../../config/logger');
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");

const ManagerUserModel = require("../models/ManagerUser.model");



const mongoose = require("mongoose");
var _ = require("lodash");
const optionModel = require("../models/Option.model");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};



exports.getAll = async (req, res) => {
  try {
    const finded = await ProcessFlowTemplateModel
      .find()
      .populate([{
        path: 'categoriestemplate',
        populate: {
          path: 'itemstemplate',
          populate: {
            path: 'optionstemplate',

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


exports.getAllAvailableManager = async (req, res) => {
  try {

    const findedAllManagers = await ManagerUserModel.find( ).select('_id name');
    const findedAllAvailableManagers = await ManagerUserModel.find({
      $or: [{
        processflowtemplate: {
          $exists: false
        }
      }, {
        processflowtemplate: {
          $eq: null
        }
      }]
    }).select('_id name');

    res.status(200).json({
      success: true,
      data: findedAllAvailableManagers,
      all: findedAllManagers,
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
    const finded = await ProcessFlowTemplateModel
      .find({
        managerusers: {
          $elemMatch: {
            _id: id
          }
        }
      })

      .populate([{
        path: 'categoriestemplate',
        populate: {
          path: 'itemstemplate',
          populate: {
            path: 'optionstemplate',

          }
        }
      }]);
    /*       .populate([{
            path: 'opportunities',
            populate: {
              path: 'discussions',
              populate: {
                path: 'messages'
              }
            }
          }]);
     */
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
    const finded = await ProcessFlowTemplateModel
      .findById(id)
      .populate([{
        path: 'categoriestemplate',
        populate: {
          path: 'itemstemplate',
          populate: {
            path: 'optionstemplate',

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


exports.create = async (req, res) => {
  try {
    const data = req.body;
    const {
      id
    } = req.params;
    //validate data as required
    verifyData(res, req.body);
    const newOne = new ProcessFlowTemplateModel(data);
    await newOne.save();


    res.status(200).json({
      success: true,
      data: newOne
    })

  } catch (error) {
    logger.error(error.message);
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

    const edited = await ProcessFlowTemplateModel.findByIdAndUpdate(id, data);

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


exports.addManager = async (req, res) => {
  try {
    if (req.query.manager_id == "undefined") throw TypeError(`manager_id not given`);
    if (req.query.processflowtemplate_id == "undefined") throw TypeError(`processflowtemplate_id not given`);
    //console.log(req.query.manager_id)
    //console.log(req.query.processflowtemplate_id)

    //seek for ProcessFlowTemplate
    const findedProcessFlowTemplate = await ProcessFlowTemplateModel.findById(req.query.processflowtemplate_id);
    if (!findedProcessFlowTemplate) throw TypeError(`processflowtemplate with id ${req.query.processflowtemplate_id} not found`);

    //seek for ManagerUser
    const findedManagerUser = await ManagerUserModel.findById(req.query.manager_id);
    if (!findedManagerUser) throw TypeError(`ManagerUser with id ${req.query.manager_id} not found`);

    const editedManagerUser = await ManagerUserModel.findByIdAndUpdate(req.query.manager_id, {
      processflowtemplate: findedProcessFlowTemplate._id
    });
    const editedProcessFlowTemplate = await ProcessFlowTemplateModel.findOneAndUpdate(
      {_id:req.query.processflowtemplate_id,
        managerusers: {
          $ne: findedManagerUser._id
        }
      }, 
      {
      $push: {
        managerusers: findedManagerUser._id
      }
    });

   

    res.status(200).json({
      success: true,

    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.removeManager = async (req, res) => {
  try {
    if (req.query.manager_id == "undefined") throw TypeError(`manager_id not given`);
    if (req.query.processflowtemplate_id == "undefined") throw TypeError(`processflowtemplate_id not given`);
    //console.log(req.query.manager_id)
    //console.log(req.query.processflowtemplate_id)

    //seek for ProcessFlowTemplate
    const findedProcessFlowTemplate = await ProcessFlowTemplateModel.findById(req.query.processflowtemplate_id);
    if (!findedProcessFlowTemplate) throw TypeError(`processflowtemplate with id ${req.query.processflowtemplate_id} not found`);

    //seek for ManagerUser
    const findedManagerUser = await ManagerUserModel.findById(req.query.manager_id);
    if (!findedManagerUser) throw TypeError(`ManagerUser with id ${req.query.manager_id} not found`);

    const editedManagerUser = await ManagerUserModel.findByIdAndUpdate(req.query.manager_id, {
      processflowtemplate: null
    });
    const editedProcessFlowTemplate = await ProcessFlowTemplateModel.findByIdAndUpdate(req.query.processflowtemplate_id, {
      $pull: { managerusers: { $eq:  findedManagerUser._id } }     

    });

    

    res.status(200).json({
      success: true,

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
    const todeleted = await ProcessFlowTemplateModel.findByIdAndDelete(id);
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
    const todeleted = await ProcessFlowTemplateModel.findById(id);
    if (todeleted) {
      if ((todeleted.categoriestemplate.length == 0) && (todeleted.managerusers.length == 0)) {
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

 */


/* 
exports.delete = async (req, res) => {
  const {
    id
  } = req.params;
  //console.log(id);
  try {
    const todeleted = await ProcessFlowModel.findById(id)
    .populate([{path: 'categories',populate: {path: 'items'}}   , {path: 'manageruser',populate: {path: 'salesusers'}}  ])
    if (todeleted) {
      if (todeleted.categories.length != 0) {
        todeleted.categories.forEach(async (element) => {
          console.log(element);
          if (element.items.length != 0) {
            element.items.forEach(async (subelement) => {
              console.log(subelement);
              const subsubitemdeleted = await ItemModel.findByIdAndDelete(subelement._id);
              if (!subsubitemdeleted) console.log("item not found"); // res.status(404).send("No item found");
            });
          }
          const subitemdeleted = await CategoryModel.findByIdAndDelete(element._id);
          if (!subitemdeleted) console.log("item not found"); // res.status(404).send("No item found");
        });
      }
    } else {
      console.log("item not found");
    }
    const deleted = await OpportunityModel.findByIdAndDelete(id);
    res.status(200).json({
      success: true,
      data: deleted
    })
  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
}; */