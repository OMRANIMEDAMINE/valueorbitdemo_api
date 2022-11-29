const SignalMRModel = require("../models/SignalMR.model");
const ActionMRModel = require("../models/ActionMR.model");
const OpportunityModel = require("../models/Opportunity.model");
const ManagerUserModel = require("../models/ManagerUser.model");
const SalesUserModel = require("../models/SalesUser.model");

const ObjectID = require('mongoose').Types.ObjectId;
const logger = require('../../config/logger');

const axios = require('axios');
const setTZ = require("set-tz");

//Set Time Zone
setTZ('Europe/Jersey')

// Moment Config
let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}


exports.getAll = async (req, res) => {
  try {


    const data = await SignalMRModel.find();

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
exports.getAll_IDS = async (req, res) => {
  try {


    const data = await SignalMRModel.find().select('_id');

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

exports.create = async (req, res) => {
  try {
    if (req.body == "undefined") throw TypeError("Request body undefined");
    const data = req.body;
    if (Object.keys(data).length === 0) throw TypeError("Empty body");

    const newOne = new SignalMRModel(data);
    newOne.createddate = Date.now();
    // console.log(data.oppId)

    const findedOppo = await OpportunityModel.findOne({
      "idorigin": {
        $eq: data.oppId
      }
    })

    if (!findedOppo) throw TypeError("Opportunity not found");
    newOne.opportunity = findedOppo._id

    const newSignalMR = await newOne.save();

    await ActionMRModel.updateMany({
      '_id': newSignalMR.actions_id
    }, {
      $push: {
        signal_ids: newSignalMR._id
      }
    });

    res.status(200).json({
      success: true,
      data: newSignalMR
    });

  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


const GetSignalsFromAI = async () => {
  try {
    logger.info(`Getting Signals from AI (URL: ${process.env.AI_BASE_URL_4000}/matchrules?new=1 ) is started . . .`)


    let res = await axios.get(`${process.env.AI_BASE_URL_4000}/matchrules?new=1`);
    //console.log(`${process.env.AI_BASE_URL_4000}/matchrules?new=1`);

    // Work with the response...
    logger.info(`Getting Signals from AI works properly !`)
    return res;
  } catch (error) {
    if (error.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Getting Signals from AI not works - sync api return an error response !-- Details: ${error.message} `)

    } else if (error.request) {
      // The client never received a response, and the request was never left
      logger.error(`Getting Signals from AI not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+error.message}`)
    } else {
      // Anything else
      logger.error(`Getting Signals from AI not works - unknown error ! -- Details: ${error.message} `)
    }
  }
};



exports.load = async (req, res) => {
  try {

    const results = await GetSignalsFromAI();
    if (!results) throw Error("Getting Signals from AI not works !! Check with Administrator");
    // console.log(results.data);
    let json = results.data
    //console.log(json.opps_data.opps_data)

    // Opportunities Signals
    logger.info(`Saving ${json.opps_data.signals.length} new opportunity signals starts . . . `)
    if (json.opps_data.signals.length > 0) {
      json.opps_data.signals.forEach(async sig => {
        if (sig.id == "undefined") logger.warn(`SignalMR id is undefined`);
        if (sig.oppId == "undefined") logger.warn(`Opportunity id is undefined`);
        let findedOppo = await OpportunityModel.findOne({
          idorigin: sig.oppId
        });
        if (findedOppo) {
          logger.info(`Adding Opportunity signal with ID  ${sig.id}`);
          const newOne = new SignalMRModel(sig);
          newOne.category = "opportunity";
          newOne._id = sig.id;
          newOne.createddate = Date.now();
          newOne.opportunity = findedOppo._id;
          newOne.sales = null;
          newOne.manager = null;
          sig.oppId ? newOne.oppId = sig.oppId : newOne.oppId = null;
          sig.value ? newOne.value = sig.value : newOne.value = null;
          sig.type ? newOne.type = sig.type : newOne.type = null;
          sig.actions_id ? newOne.actions_id = sig.actions_id : newOne.actions_id = [];
          //console.log(" sig.actions_id" ,  sig.actions_id)
          //Set Fiscal Settings
          sig.fiscalyear ? newOne.fiscalyear = sig.fiscalyear : newOne.fiscalyear = null;
          sig.fiscalquarter ? newOne.fiscalquarter = sig.fiscalquarter : newOne.fiscalquarter = null;
          sig.fiscalmonth ? newOne.fiscalmonth = sig.fiscalmonth : newOne.fiscalmonth = null;
          const newSignalMR = await newOne.save();

          await ActionMRModel.updateMany({
            '_id': newSignalMR.actions_id
          }, {
            $push: {
              signal_ids: newSignalMR._id
            }
          });
        }
      });
    }
    logger.info(`Saving ${json.opps_data.signals.length} new opportunity signals works properly `)

    // Sales Signals
    logger.info(`Saving ${json.sales_data.signals.length} new sales signals starts . . . `)
    if (json.sales_data.signals.length > 0) {
      json.sales_data.signals.forEach(async sig => {
        if (sig.id == "undefined") logger.warn(`SignalMR id is undefined`);
        if (sig.salesId == "undefined") logger.warn(`sales id is undefined`);
        let findedSales = await SalesUserModel.findOne({
          idorigin: sig.salesId
        });
        if (findedSales) {
          logger.info(`Adding sales signal with ID  ${sig.id}`);
          const newOne = new SignalMRModel(sig);
          newOne.category = "sales";
          newOne._id = sig.id;
          newOne.createddate = Date.now();
          newOne.opportunity = null;
          newOne.sales = findedSales._id;
          newOne.manager = null;
          sig.salesId ? newOne.salesId = sig.salesId : newOne.salesId = null;
          sig.value ? newOne.value = sig.value : newOne.value = null;
          sig.type ? newOne.type = sig.type : newOne.type = null;
          sig.actions_id ? newOne.actions_id = sig.actions_id : newOne.actions_id = [];
          //Set Fiscal Settings
          sig.fiscalyear ? newOne.fiscalyear = sig.fiscalyear : newOne.fiscalyear = null;
          sig.fiscalquarter ? newOne.fiscalquarter = sig.fiscalquarter : newOne.fiscalquarter = null;
          sig.fiscalmonth ? newOne.fiscalmonth = sig.fiscalmonth : newOne.fiscalmonth = null;
          const newSignalMR = await newOne.save();

          await ActionMRModel.updateMany({
            '_id': newSignalMR.actions_id
          }, {
            $push: {
              signal_ids: newSignalMR._id
            }
          });
        }
      });
    }
    logger.info(`Saving ${json.sales_data.signals.length} new sales signals works properly `)



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



exports.getById = async (req, res) => {
  try {
    if (req.params.id == "undefined") throw TypeError("Id not given !");
    const {
      id
    } = req.params;
    const sig = await SignalMRModel.findById(req.params.id);

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
    const data = await SignalMRModel.find(query)
      .populate([{
          path: 'actions_id',
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

    const data = await SignalMRModel.find(query)
      .populate([{
          path: 'actions_id',
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
      data = await SignalMRModel.find(query)
        .populate([{
            path: 'actions_id',
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
      data = await SignalMRModel.find(query)
        .populate([{
            path: 'actions_id',
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




/* 
exports.load = async (req, res) => {
  try {

    const results = await GetSignalsFromAI();
    if (!results) throw Error("Getting Signals from AI not works !! Check with Administrator");
    // console.log(results.data);
    let json = results.data
    //console.log(json.opps_data.opps_data)
    // Opportunities Signals
    if (json.opps_data.signals.length > 0) {
      json.opps_data.signals.forEach(async sig => {
        if (sig.id == "undefined") logger.warn(`SignalMR id is undefined`);
        if (sig.oppId == "undefined") logger.warn(`Opportunity origin id is undefined`);
        let findedOppo = await OpportunityModel.findOne({
          idorigin: sig.oppId
        });
        if (findedOppo) {
          //comments for testing with no impacts
          const findedSignalsMRModel = await SignalMRModel.findOne({
            _id: sig.id
          });
          if (!findedSignalsMRModel) {
            logger.info(`Adding Opportunity signal with ID  ${sig.id}`);
            const newOne = new SignalMRModel(sig);
            newOne._id = sig.id;
            newOne.createddate = Date.now();
            newOne.opportunity = findedOppo._id;
            newOne.value = sig.value
            newOne.category = "opportunity";
            const newSignalMR = await newOne.save();

            await ActionMRModel.updateMany({
              '_id': newSignalMR.actions_id
            }, {
              $push: {
                signal_ids: newSignalMR._id
              }
            });

          } else {
            // if found and type == Number of days in stage set   `)
            logger.info(`Updating Opportunity signal considering Number of days in stage not implemented yet`);
            /*
            if (sig.type === "Number of days in stage") {
              //console.log(" new sig.value : "+  sig.value)
              const found = await SignalMRModel.findOneAndUpdate({
                "oppId": {
                  $eq: sig.oppId
                },
                "type": {
                  $eq: sig.type
                },
                "type": {
                  $eq: "Number of days in stage"
                }
              }, {
                value: sig.value,
                _id: sig._id
              })

             // PersonModel.find({ favouriteFoods: { "$in" : ["sushi"]} }, ...);
              //"billingcountry": {      "$exists": true,                "$ne": ""              } 

              await ActionMRModel.updateMany({
                signal_ids: {
                  "$in": [found._id]
                }
              }, {
                $pull: {
                  signal_ids: found._id
                },
                $push: {
                  signal_ids: sig._id
                },
              });

              logger.info(`Opportunity signal with origin id ${sig.oppId} updated value`);
            }
          }
        }
      });
    }


    logger.info(`Saving ${json.opps_data.signals.length} new opportunity signals works properly `)




    res.status(200).json({
      success: true
      //data: newSignalMR
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

exports.delete = async (req, res) => {
  try {
    const _id = req.params.id;
    if (_id == "undefined") throw TypeError("id undefined");
    const signal = await SignalMRModel.findById({
      _id
    });
    await signal.remove();
    await ActionMRModel.updateMany({
      '_id': signal.actions_id
    }, {
      $pull: {
        signal_ids: signal._id
      }
    });

    res.status(200).json({
      success: true,
      data: signal
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
    const edited = await SignalMRModel.findByIdAndUpdate(id, data);

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


/*
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
*/
/* 
exports.update = async (req, res) => {
  try {
    const _id = req.params.id;
    if (_id == "undefined") throw TypeError("id undefined");
    const { signal } = req.body;
    const newactions_id= signal?.actions_id || [];
  
    const oldSignal = await SignalMRModel.findOne({ _id });
    const oldactions_id = oldSignal?.actions_id;
  
    Object.assign(oldSignal, signal);
    const newSignal = await oldSignal.save();
  
    const added = difference(newactions_id, oldactions_id);
    const removed = difference(oldactions_id, newactions_id);
    await ActionMRModel.updateMany({ '_id': added }, { $addToSet: { signal_ids: foundProduct._id } });
    await ActionMRModel.updateMany({ '_id': removed }, { $pull: { signal_ids: foundProduct._id } });
  
    res.status(200).json({
      success: true,
      data: newSignal
    });



  } catch (error) {
    logger.error(error.message);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};  */