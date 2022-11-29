const ActionMRModel = require("../models/ActionMR.model");
const SignalMRModel = require("../models/SignalMR.model");
const OpportunityModel = require("../models/Opportunity.model");
const ManagerUserModel = require("../models/ManagerUser.model");
const SalesUserModel = require("../models/SalesUser.model");
const logger = require('../../config/logger');
const axios = require('axios');
const setTZ = require('set-tz');

//Set Time Zone
setTZ('Europe/Jersey')

// Moment Config
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}

const GetActionsFromAI = async () => {
  try {
    logger.info(`Getting Actions from AI (URL: ${process.env.AI_BASE_URL_4000}/matchrules?new=1 ) is started . . .`)


    let res = await axios.get(`${process.env.AI_BASE_URL_4000}/matchrules?new=1`);
    //console.log(`${process.env.AI_BASE_URL_4000}/matchrules?new=1`);

    // Work with the response...
    logger.info(`Getting Actions from AI works properly !`)
    return res;
  } catch (error) {
    if (error.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Getting Actions from AI not works - sync api return an error response !-- Details: ${error.message} `)

    } else if (error.request) {
      // The client never received a response, and the request was never left
      logger.error(`Getting Actions from AI not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+error.message}`)
    } else {
      // Anything else
      logger.error(`Getting Actions from AI not works - unknown error ! -- Details: ${error.message} `)
    }
  }
};

 

exports.getby = async (req, res) => {
  try {
    var query = {};
    if (req.query.category) {
      query["category"] = req.query.category
    }

    if (req.query.id) {
      query[`${req.query.category}`] = req.query.id
    }
 

    /*  console.log(req.query.category )
     console.log(req.query.id ) */
    const data = await ActionMRModel.find(query)
      .populate([{
          path: 'signal_ids',
        },
        {
          path: 'opportunity',
          select: ('id name account'),
          populate: [{
              path: 'account',
              select: ('name billingcountry'),
            },
            {
              path: 'salesuser',
              select: ('id name'),
            },
          ]
        }
      ])

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
exports.getbyofsales = async (req, res) => {
  try {
    var query = {};
     query["category"] = "opportunity"
    
    if (req.params.id == "undefined") throw TypeError("ID sales not given");

    const data = await ActionMRModel.find(query)
      .populate([{
          path: 'signal_ids',
        },
        {
          path: 'opportunity',
          select: ('id name account'),
          populate: [{
              path: 'account',
              select: ('name billingcountry'),
            },
            {
              path: 'salesuser',
              select: ('_id name')            

            },
          ]
        }
      ])
 
      const data2 = data.filter(item => (item.opportunity.salesuser._id).toString() === req.params.id)
      
      

    res.status(200).json({
      success: true,
      data: data2, 
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

/*
exports.getbyofmanager = async (req, res) => {
  try {

   
    if (req.params.id == "undefined") throw TypeError("ID manager not given");
    const manager = await ManagerUserModel.findById(req.params.id)
    if (!manager) throw TypeError(" manager not exist");

    console.log(manager?.salesusers);

    var query = {};
    query["category"] = "opportunity"

    const data = await ActionMRModel.find(query)
      .populate([{
          path: 'signal_ids',
        },
        {
          path: 'opportunity',
          select: ('id name account'),
          populate: [{
              path: 'account',
              select: ('name billingcountry'),
            },
            {
              path: 'salesuser',
              select: ('_id name')            

            },
          ]
        }
      ])
 
      const data2 = data.filter(item =>  manager.salesusers.includes(item.opportunity.salesuser._id))
      
      
     res.status(200).json({
      success: true, 
      data:data2
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};
*/


exports.getbyofmanager = async (req, res) => {
  try {
    var query = {};

    if (req.params.id == "undefined") throw TypeError("ID manager not given");
    const manager = await ManagerUserModel.findById(req.params.id)
    if (!manager) throw TypeError(" manager not exist");
    //console.log(manager?.salesusers);

    if (req.query.category == "undefined") throw TypeError("category not given");
    query["category"] = req.query.category

    let data = []
    if (query["category"] == "opportunity") {
      data = await ActionMRModel.find(query)
        .populate([{
            path: 'signal_ids',
          },
          {
            path: 'opportunity',
            select: ('id name account'),
            populate: [{
                path: 'account',
                select: ('name billingcountry'),
              },
              {
                path: 'salesuser',
                select: ('_id name')

              },
            ]
          }
        ])
    }
    if (query["category"] == "sales") {
      data = await ActionMRModel.find(query)
        .populate([{
            path: 'signal_ids',
          },
          {
            path: 'opportunity',
            select: ('id name account'),
            populate: [{
                path: 'account',
                select: ('name billingcountry'),
              },
              {
                path: 'salesuser',
                select: ('_id name')

              },
            ]
          }
        ])
    }

    const data2 = data.filter(item => manager.salesusers.includes(item.opportunity.salesuser._id))


    res.status(200).json({
      success: true,
      data: data2
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.load = async (req, res) => {
  try {

    const results = await GetActionsFromAI();
    if (!results) throw Error("Getting actions from AI not works !! Check with Administrator");
    // console.log(results.data);
    let json = results.data
    //console.log(json.opps_data.opps_data)
    // Opportunities actions
    logger.info(`Saving ${json.opps_data.actions.length} new opportunity actions starts . . . `)
    if (json.opps_data.actions.length > 0) {
      json.opps_data.actions.forEach(async sig => {
        if (sig.id == "undefined") logger.warn(`ActionMR id is undefined`);
        if (sig.oppId == "undefined") logger.warn(`Opportunity id is undefined`);
        let findedOppo = await OpportunityModel.findOne({
          idorigin: sig.oppId
        });
        if (findedOppo) {
          logger.info(`Adding Opportunity signal with ID  ${sig.id}`);
          const newOne = new ActionMRModel(sig);
          newOne.category = "opportunity";
          newOne._id = sig.id;
          newOne.createddate = Date.now();
          newOne.opportunity = findedOppo._id;
          newOne.sales = null;
          newOne.manager = null;
          sig.oppId ? newOne.oppId = sig.oppId : newOne.oppId = null; 
          sig.value ? newOne.value = sig.value : newOne.value = null; 
          sig.type ? newOne.type = sig.type : newOne.type = null; 
          sig.signal_ids ? newOne.signal_ids = sig.signal_ids : newOne.signal_ids = []; 
          //console.log(" sig.signal_ids" ,  sig.signal_ids)

          //Set Fiscal Settings
          sig.fiscalyear ? newOne.fiscalyear = sig.fiscalyear : newOne.fiscalyear = null; 
          sig.fiscalquarter ? newOne.fiscalquarter = sig.fiscalquarter : newOne.fiscalquarter = null; 
          sig.fiscalmonth ? newOne.fiscalmonth = sig.fiscalmonth : newOne.fiscalmonth = null;
          const newActionMR = await newOne.save();

          await SignalMRModel.updateMany({
            '_id': newActionMR.signal_ids
          }, {
            $push: {
              actions_id: newActionMR._id
            }
          });
        }
      });
    }
    logger.info(`Saving ${json.opps_data.actions.length} new opportunity actions works properly `)

    // Sales actions
    logger.info(`Saving ${json.sales_data.actions.length} new sales actions starts . . . `)
    if (json.sales_data.actions.length > 0) {
      json.sales_data.actions.forEach(async act => {
        if (act.id == "undefined") logger.warn(`ActionMR id is undefined`);
        if (act.salesId == "undefined") logger.warn(`sales id is undefined`);
        let findedSales = await SalesUserModel.findOne({
          idorigin: act.salesId
        });
        if (findedSales) {
          logger.info(`Adding sales actions with ID  ${sig.id}`);
          const newOne = new  SignalMRModel(act);
          newOne.category = "sales";
          newOne._id = act.id;
          newOne.createddate = Date.now();
          newOne.opportunity = null;
          newOne.sales = findedSales._id;
          newOne.manager = null;
          act.salesId ? newOne.salesId = act.salesId : newOne.salesId = null; 
          act.value ? newOne.value = act.value : newOne.value = null; 
          act.type ? newOne.type = act.type : newOne.type = null; 
          act.actions_id ? newOne.actions_id = act.actions_id : newOne.actions_id = []; 
          //Set Fiscal Settings
          act.fiscalyear ? newOne.fiscalyear = act.fiscalyear : newOne.fiscalyear = null; 
          act.fiscalquarter ? newOne.fiscalquarter = act.fiscalquarter : newOne.fiscalquarter = null; 
          act.fiscalmonth ? newOne.fiscalmonth = act.fiscalmonth : newOne.fiscalmonth = null;
          const newActionlMR = await newOne.save();

          await SignalMRModel.updateMany({
            '_id': newActionlMR.actions_id
          }, {
            $push: {
              signal_ids: newActionlMR._id
            }
          }); 
        }
      });
    }
    logger.info(`Saving ${json.sales_data.actions.length} new sales actions works properly `)

    res.status(200).json({
      success: true
    });

  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllIDs = async (req, res) => {
  try {
    const manager_sig = await managerActionsModel.find().select('_id  idorigin isFlagged isDeleted isSnoozed isIgnored ')
    const sales_sig = await SalesActionsModel.find().select('_id  idorigin isFlagged isDeleted isSnoozed isIgnored ')
    res.status(200).json({
      success: true,
      manager_actions: manager_sig,
      sales_actions: sales_sig
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getById = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id not given !");
    const {
      id
    } = req.params;
    const sig = await ActionMRModel.findById(req.params.id);

    res.status(200).json({
      success: true,
      data: sig
    });

  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.create = async (req, res) => {
  try {
    if (req.body == "undefined") throw TypeError("Request body undefined");
    const data = req.body;
    if (Object.keys(data).length === 0) throw TypeError("Empty body");

    const newOne = new ActionMRModel(data);
    newOne.createddate = Date.now();
    console.log(data.oppId)

    const findedOppo = await OpportunityModel.findOne({
      "idorigin": {
        $eq: data.oppId
      }
    })

    if (!findedOppo) throw TypeError("Opportunity not found");
    newOne.opportunity = findedOppo._id

    const newActionMR = await newOne.save();

    await SignalMRModel.updateMany({
      '_id': newActionMR.signal_ids
    }, {
      $push: {
        actions_id: newActionMR._id
      }
    });

    res.status(200).json({
      success: true,
      data: newActionMR
    });

  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAll = async (req, res) => {
  try {


    const data = await ActionMRModel.find();

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getAllIDs = async (req, res) => {
  try {


    const data = await ActionMRModel.find().select('_id');

    res.status(200).json({
      success: true,
      data: data
    });
  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

function difference(A, B) {
  const arrA = Array.isArray(A) ? A.map(x => x.toString()) : [A.toString()];
  const arrB = Array.isArray(B) ? B.map(x => x.toString()) : [B.toString()];

  const result = [];
  for (const p of arrA) {
    if (arrB.indexOf(p) === -1) {
      result.push(p);
    }
  }

  return result;
}

 /*
exports.update = async (req, res) => {
  try {
    const _id = req.params.id;
    if (_id == "undefined") throw TypeError("id undefined");
    const { action } = req.body;
    const newCategories = action.signal_ids || [];
  
    const oldProduct = await Product.findOne({ _id });
    const oldCategories = oldProduct.signal_ids;
  
    Object.assign(oldProduct, action);
    const newProduct = await oldProduct.save();
  
    const added = difference(newCategories, oldCategories);
    const removed = difference(oldCategories, newCategories);
    await Category.updateMany({ '_id': added }, { $addToSet: { products: foundProduct._id } });
    await Category.updateMany({ '_id': removed }, { $pull: { products: foundProduct._id } });
 
    res.status(200).json({
      success: true,
      data: newProduct
    });



  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};*/ 

exports.delete = async (req, res) => {
  try {
    const _id = req.params.id;
    if (_id == "undefined") throw TypeError("id undefined");
    const action = await ActionMRModel.findById({
      _id
    });
    await action.remove();
    await SignalMRModel.updateMany({
      '_id': action.signal_ids
    }, {
      $pull: {
        actions_id: action._id
      }
    });

    res.status(200).json({
      success: true,
      data: action
    });

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

  if ((req.body == "undefined") || (Object.keys(req.body).length === 0)) throw TypeError("No body request was given");
   const data = req.body;

  if (req.params.id == "undefined") throw TypeError("No Id was given not given"); 
  const {
    id
  } = req.params;

  try {
    //console.log("Valid Id Param " + id);
    const edited = await ActionMRModel.findByIdAndUpdate(id, data);

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
