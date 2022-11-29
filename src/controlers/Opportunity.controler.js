const logger = require('../../config/logger');
const OpportunityModel = require("../models/Opportunity.model");
const ProcessFlowModel = require("../models/ProcessFlow.model");
const ManagerJudgementModel = require("../models/ManagerJudgement.model");
const ObjectID = require('mongoose').Types.ObjectId;
const axios = require('axios');
const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");
const RedshiftOpportunityHistoryLogModel = require("../aws/RedshiftOpportunityHistoryLog.model");
const CategoryModel = require("../models/Category.model");
const ItemModel = require("../models/Item.model");
const OptionModel = require("../models/Option.model");
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");

const redshiftClient = require("../../config/redshiftConfig");
const short = require('short-uuid');
const {
  uuidEmit,
  uuidParse,
  uuidParseNano
} = require('uuid-timestamp');


let moment = require("moment");
if ("default" in moment) {
  moment = moment["default"];
}

const mongoose = require("mongoose");

var _ = require("lodash");
const {
  vary
} = require("express/lib/response");
const {
  system
} = require("nodemon/lib/config");
const {
  forEach
} = require("lodash");

const verifyData = (res, data = {}) => {
  if (Object.keys(data).length === 0) {
    res.status(204).send("no_data");
    return;
  }
};

const stompit = require('stompit');

//Get Env Configs
require("dotenv").config();



//ACTIVE_MQ CONFIG 
const connectOptions = {
  'host': process.env.ACTIVEMQ_HOST,
  'port': parseInt(process.env.ACTIVEMQ_PORT),
  'ssl': (process.env.ACTIVEMQ_SSL === "true"),
  'connectHeaders': {
    'host': '/',
    'login': process.env.ACTIVEMQ_LOGIN,
    'passcode': process.env.ACTIVEMQ_PASSCODE,
    'heart-beat': process.env.ACTIVEMQ_HEART_BEAT
  }
};


function monthDiff(d1, d2) {
  if (d2.year() > d1.year()) return true
  if ((d2.year() == d1.year()) && ((d2.month() - d1.month()) > 0)) return true
  return false;
}




exports.setPlaybookToOppo = async (req, res) => {
  try {
    if (req.query.opportunity == "undefined") throw TypeError("opportunity ID not given");
    if (req.params.processflowtemplate == "undefined") throw TypeError("processflowtemplate ID not given");

    const FindedPFT = await ProcessFlowTemplateModel.findById(req.query.processflowtemplate).populate(
      [{
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
      }]
    )
    if (!FindedPFT) throw TypeError("Processflowtemplate not found");

    const FindedOppo = await OpportunityModel.findById(req.query.opportunity);
    if (!FindedOppo) throw TypeError("Opportunity not found");



    var duplicate = new ProcessFlowModel();
    duplicate.name = FindedPFT.name;
    for (let category of FindedPFT.categoriestemplate) {
      var cat = new CategoryModel();
      cat.name = category.name;
      cat.description = category.description;
      cat.processflow = duplicate._id; // set to process flow
      for (let item of category.itemstemplate) {
        var itm = new ItemModel();
        itm.name = item.name;
        itm.description = item.description;
        itm.category = cat._id; // set to category
        for (let option of item.optionstemplate) {
          var op = new OptionModel();
          op.name = option.name;
          op.type = option.type; // set to item
          op.values = option.values; // set to item
          op.item = itm._id; // set to item
          var newop = await op.save();
          itm.options.push(newop);
        }
        var newitm = await itm.save();
        cat.items.push(newitm);
      }
      var newcat = await cat.save();
      duplicate.categories.push(newcat);
    }
    const newprocessflow = await duplicate.save();



    await OpportunityModel.findByIdAndUpdate(req.query.opportunity, {
      processflow: newprocessflow._id,
      last_modified: Date.now(),
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.setPlaybookToSales = async (req, res) => {
  try {
    if (req.query.sales == "undefined") throw TypeError("sales ID not given");
    if (req.params.processflowtemplate == "undefined") throw TypeError("processflowtemplate ID not given");

    const FindedPFT = await ProcessFlowTemplateModel.findById(req.query.processflowtemplate).populate(
      [{
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
      }]
    )

    if (!FindedPFT) throw TypeError("processflowtemplate not found");

    const FindedSales = await SalesModel.findById(req.query.sales);
    if (!FindedSales) throw TypeError("Sales not found");

    const FindedOppos = await OpportunityModel.find({
      salesuser: FindedSales._id
    });
    if (!FindedOppos) throw TypeError("Opportunities not found");
    if (FindedOppos.length > 0) {

      FindedOppos.forEach(async (oppo) => {
        var duplicate = new ProcessFlowModel();
        duplicate.name = FindedPFT.name;
        for (let category of FindedPFT.categoriestemplate) {
          var cat = new CategoryModel();
          cat.name = category.name;
          cat.description = category.description;
          cat.processflow = duplicate._id; // set to process flow
          for (let item of category.itemstemplate) {
            var itm = new ItemModel();
            itm.name = item.name;
            itm.description = item.description;
            itm.category = cat._id; // set to category
            for (let option of item.optionstemplate) {
              var op = new OptionModel();
              op.name = option.name;
              op.type = option.type; // set to item
              op.values = option.values; // set to item
              op.item = itm._id; // set to item
              var newop = await op.save();
              itm.options.push(newop);
            }
            var newitm = await itm.save();
            cat.items.push(newitm);
          }
          var newcat = await cat.save();
          duplicate.categories.push(newcat);
        }
        const newprocessflow = await duplicate.save();
        await OpportunityModel.findByIdAndUpdate(oppo._id, {
          processflow: newprocessflow._id,
          last_modified: Date.now(),
        });
      });
    }
    res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getCount = async (req, res) => {
  try {
    const finded = await OpportunityModel.countDocuments();
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
/*
exports.getCount = async (req, res) => {
  try {
    //console.log("Get Count aopportunities");

    const finded = await OpportunityModel.find(); //.distinct('originid');

    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      }


    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);


    }

    res.status(200).json({
      success: true,
      report: report

    });


  } catch (error) {
        logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};*/


exports.getAllForAI = async (req, res) => {
  try {
    // console.log("Get all opportunities ");
    const finded = await OpportunityModel
      .find()
      .select('-__v -manageruser    -ai_predictions    -rowid -salesuser')
      .populate([{
          path: 'processflow',
          select: ('-__v -opportunity -createddate'),
          populate: {
            path: 'categories',
            select: ('-__v -createddate -processflow'),
            populate: {
              path: 'items',
              select: ('-__v -createddate -category'),
              populate: {
                path: 'messages',
                select: ('-__v -item'),

              },
              /* populate: {
                path: 'itemupdates',
                select: ('-__v -item'),

              }, */


            }
          }
        },
        {
          path: 'salesuser',
          select: ('-password -__v -opportunities -createddate -firstname -lastname'),
          populate: {
            path: 'manageruser',
            select: ('-password -__v -opportunities -createddate -salesusers -firstname -lastname -processflowtemplate'),
          }
        } 

      ]);


    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }


    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);

    }

    res.status(200).json({
      success: true,
      data: finded,
      report: report

    });



  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getAllIDS = async (req, res) => {
  try {
    // console.logetAllIDSg("Get all opportunities ");
    const finded = await OpportunityModel
      .find()
      .select('__id')


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


exports.getAll = async (req, res) => {
  try {
    // console.log("Get all opportunities ");
    const finded = await OpportunityModel
      .find()
      .select('-__v -manageruser    -ai_predictions -processflow')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        }, 
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);


    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,

        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);


    }

    res.status(200).json({
      success: true,
      data: finded,
      report: report

    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBy = async (req, res) => {
  try {
    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []

    var query = {};
    var date1 = new Date();
    var date2 = new Date();

    if (req.query.isclosed) {
      query["isclosed"] = req.query.isclosed
    }
    if (req.query.iswon) {
      query["iswon"] = req.query.iswon
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }


    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
    }

    /*
    if (req.query.fiscalmonth) {

      date1.setYear(parseInt(req.query.fiscalyear));
      date1.setMonth(parseInt(req.query.fiscalmonth - 1));
      date1.setDate(1);


      date2.setYear(parseInt(req.query.fiscalyear));
      date2.setMonth(parseInt(req.query.fiscalmonth - 1));
      date2.setDate(31);
 
      query["closedate"] = {
        $gte: date1,
        $lte: date2
      }

    }*/
    //  console.log("date1 :" + date1);
    // console.log("date2 : " + date2);



    if (req.query.forecastcategory) {
      query["forecastcategoryname"] = req.query.forecastcategory
    }
    if (req.query.stagename) {
      query["stagename"] = req.query.stagename
    }

    if ((req.query.amountmin) && (req.query.amountmax)) {
      query["amount"] = {
        $gte: req.query.amountmin,
        $lte: req.query.amountmax
      }
    } else {
      if (req.query.amountmin) {
        query["amount"] = {
          $gte: req.query.amountmin
        }
      }
      if (req.query.amountmax) {
        query["amount"] = {
          $lte: req.query.amountmax
        }
      }
    }

    /*   if ((req.query.amountmin) && (req.query.amountmax)) {
        query["amount"] = {
          $gte: req.query.amountmin,
          $lte: req.query.amountmax
        }
      }
   */




    const finded = await OpportunityModel.find(query).select(' -processflow  -ai_predictions')
      .populate([{
          path: 'account',
          select: ('name'),
        },
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);

    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);


      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    const FindedcountDocuments = await OpportunityModel.countDocuments();

    res.status(200).json({
      success: true,
      totalOppos: FindedcountDocuments,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getByForAI = async (req, res) => {
  try {
    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []
    var query = {};

    if (req.query.isclosed) {
      query["isclosed"] = req.query.isclosed
    }
    if (req.query.iswon) {
      query["iswon"] = req.query.iswon
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }

    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
    }


    if (req.query.forecastcategory) {
      query["forecastcategoryname"] = req.query.forecastcategory
    }
    if (req.query.stagename) {
      query["stagename"] = req.query.stagename
    }
    if ((req.query.amountmin) && (req.query.amountmax)) {
      query["amount"] = {
        $gte: req.query.amountmin,
        $lte: req.query.amountmax
      }
    } else {
      if (req.query.amountmin) {
        query["amount"] = {
          $gte: req.query.amountmin
        }
      }
      if (req.query.amountmax) {
        query["amount"] = {
          $lte: req.query.amountmax
        }
      }
    }

    const finded = await OpportunityModel.find(query).select('  -ai_predictions       ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },
 
        {
          path: 'processflow',
          select: ('-__v -opportunity -createddate'),
          populate: {
            path: 'categories',
            select: ('-__v -createddate -processflow'),
            populate: {
              path: 'items',
              select: ('-__v -createddate -category'),
              populate: [{
                  path: 'messages',
                  select: ('-__v -item'),
                },
                /*            {
                  path: 'itemupdates',
                  select: ('-__v -item'),
  
                },  */
              ]
            }
          }
        },
        {
          path: 'salesuser',
          select: ('_id idorigin firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id idorigin firstname lastname username'),
          }
        }
      ]);

    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);


      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    res.status(200).json({
      success: true,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

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
  try {

    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []
    const {
      id
    } = req.params;

    const finded = await OpportunityModel
      .find({
        manageruser: id
      })
      .select('-__v -manageruser    -ai_predictions   ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },
 
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        },
        {
          path: 'processflow',
          select: ('_id name categories'),
          populate: {
            path: 'categories',
            select: ('_id name dealcoaching dealprogress'),
          }
        }
      ]);

    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);


      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);



      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    /*    const {
         id
       } = req.params; */
    const FindedcountDocuments = await OpportunityModel.countDocuments({
      manageruser: id
    });

    res.status(200).json({
      success: true,
      totalOppos: FindedcountDocuments,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

    });


  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getByManagerFilteredBy = async (req, res) => {
  try {
    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []

    const {
      id
    } = req.params;

    var query = {};
    var date1 = new Date();
    var date2 = new Date();
    query["manageruser"] = id;

    if (req.query.isclosed) {
      query["isclosed"] = req.query.isclosed
    }
    if (req.query.iswon) {
      query["iswon"] = req.query.iswon
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }
    if (req.query.fiscalmonth) {
      query["fiscalmonth"] = req.query.fiscalmonth
      /* 
            date1.setYear(parseInt(req.query.fiscalyear));
            date1.setMonth(parseInt(req.query.fiscalmonth - 1));
            date1.setDate(1);


            date2.setYear(parseInt(req.query.fiscalyear));
            date2.setMonth(parseInt(req.query.fiscalmonth - 1));
            date2.setDate(31);

            query["closedate"] = {
              $gte: date1,
              $lte: date2
            } */

    }


    if (req.query.forecastcategory) {
      query["forecastcategoryname"] = req.query.forecastcategory
    }
    if (req.query.stagename) {
      query["stagename"] = req.query.stagename
    }

    if ((req.query.amountmin) && (req.query.amountmax)) {
      query["amount"] = {
        $gte: req.query.amountmin,
        $lte: req.query.amountmax
      }
    } else {
      if (req.query.amountmin) {
        query["amount"] = {
          $gte: req.query.amountmin
        }
      }
      if (req.query.amountmax) {
        query["amount"] = {
          $lte: req.query.amountmax
        }
      }
    }

    // console.log(query)

    const finded = await OpportunityModel.find(query).select('   -ai_predictions    -processflow    ')
      .populate([{
          path: 'account',
          select: ('name'),
        },
 
        /* {
          path: 'processflow',
          select: ('-__v -opportunity -createddate'),
          populate: {
            path: 'categories',
            select: ('-__v -createddate -processflow'),
            populate: {
              path: 'items',
              select: ('-__v -createddate -category -itemupdates'),
              populate: {
                path: 'messages',
                select: ('-__v -item'),
              }
            }
          }
        }, */
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);


    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);


      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);



      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    /*    const {
         id
       } = req.params; */
    const FindedcountDocuments = await OpportunityModel.countDocuments({
      manageruser: id
    });

    res.status(200).json({
      success: true,
      totalOppos: FindedcountDocuments,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.getBySalesId = async (req, res) => {
  try {
    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []
    const {
      id
    } = req.params;

    const finded = await OpportunityModel
      .find({
        salesuser: id
      }).select('   -ai_predictions       ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },
 
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        },
        {
          path: 'processflow',
          select: ('_id name categories'),
          populate: {
            path: 'categories',
            select: ('_id name dealcoaching dealprogress'),
          }
        }
      ]);
    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }



    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);



      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    /*    const {
         id
       } = req.params; */
    const FindedcountDocuments = await OpportunityModel.countDocuments({
      salesuser: id
    });

    res.status(200).json({
      success: true,
      totalOppos: FindedcountDocuments,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};


exports.getBySalesFilteredBy = async (req, res) => {
  try {
    let jdms = []
    let jdmsAmount = []
    let jdmsCount = []
    const {
      id
    } = req.params;

    var query = {};
    var date1 = new Date();
    var date2 = new Date();
    query["salesuser"] = id;

    if (req.query.isclosed) {
      query["isclosed"] = req.query.isclosed
    }
    if (req.query.iswon) {
      query["iswon"] = req.query.iswon
    }
    if (req.query.fiscalyear) {
      query["fiscalyear"] = req.query.fiscalyear
    }
    if (req.query.fiscalquarter) {
      query["fiscalquarter"] = req.query.fiscalquarter
    }
    if (req.query.fiscalmonth) {

      date1.setYear(parseInt(req.query.fiscalyear));
      date1.setMonth(parseInt(req.query.fiscalmonth - 1));
      date1.setDate(1);


      date2.setYear(parseInt(req.query.fiscalyear));
      date2.setMonth(parseInt(req.query.fiscalmonth - 1));
      date2.setDate(31);

      query["closedate"] = {
        $gte: date1,
        $lte: date2
      }

    }
    //  console.log("date1 :" + date1);
    // console.log("date2 : " + date2);

    if (req.query.forecastcategory) {
      query["forecastcategoryname"] = req.query.forecastcategory
    }
    if (req.query.stagename) {
      query["stagename"] = req.query.stagename
    }

    if ((req.query.amountmin) && (req.query.amountmax)) {
      query["amount"] = {
        $gte: req.query.amountmin,
        $lte: req.query.amountmax
      }
    } else {
      if (req.query.amountmin) {
        query["amount"] = {
          $gte: req.query.amountmin
        }
      }
      if (req.query.amountmax) {
        query["amount"] = {
          $lte: req.query.amountmax
        }
      }
    }


    const finded = await OpportunityModel.find(query).select('  -processflow  -ai_predictions ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },
 
        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);

    const report = {
      statistics: {
        total_number: 0,
        total_amount: 0
      },

      categories: {
        total_number_Omitted: 0,
        total_amount_Omitted: 0,
        total_number_Pipeline: 0,
        total_amount_Pipeline: 0,
        total_number_Best_Case: 0,
        total_amount_Best_Case: 0,
        total_number_Commit: 0,
        total_amount_Commit: 0,
        total_number_Closed: 0,
        total_amount_Closed: 0,
      },


      stages: {
        total_number_Prospecting: 0,
        total_amount_Prospecting: 0,

        total_number_ValueProposition: 0,
        total_amount_ValueProposition: 0,

        total_number_NeedsAnalysis: 0,
        total_amount_NeedsAnalysis: 0,

        total_number_ClosedWon: 0,
        total_amount_ClosedWon: 0,

        total_number_IdDecisionMakers: 0,
        total_amount_IdDecisionMakers: 0,


        total_number_NegotiationReview: 0,
        total_amount_NegotiationReview: 0,

        total_number_Qualification: 0,
        total_amount_Qualification: 0,

        total_number_ProposalPriceQuote: 0,
        total_amount_ProposalPriceQuote: 0,

        total_number_PerceptionAnalysis: 0,
        total_amount_PerceptionAnalysis: 0,

        total_number_ClosedLost: 0,
        total_amount_ClosedLost: 0
      },
      progress: {
        total_number: 0,
        total_amount: 0
      },
      coaching: {
        total_number: 0,
        total_amount: 0
      }

    }

    //console.log(finded);

    if (finded.length != 0) {
      // Statistics General
      report.statistics.total_number = finded.length;
      report.statistics.total_amount = finded.map(row => row.amount).reduce((acc, row) => row + acc);

      // Statistics Categories
      report.categories.total_number_Omitted = finded.filter(item => item.forecastcategoryname === 'Omitted').length;
      report.categories.total_amount_Omitted = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Omitted').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Pipeline = finded.filter(item => item.forecastcategoryname === 'Pipeline').length;
      report.categories.total_amount_Pipeline = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Pipeline').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Best_Case = finded.filter(item => item.forecastcategoryname === 'Best Case').length;
      report.categories.total_amount_Best_Case = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Best Case').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Commit = finded.filter(item => item.forecastcategoryname === 'Commit').length;
      report.categories.total_amount_Commit = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Commit').reduce((sum, row) => sum + row.amount, 0);


      report.categories.total_number_Closed = finded.filter(item => item.forecastcategoryname === 'Closed').length;
      report.categories.total_amount_Closed = finded.filter(({
        forecastcategoryname
      }) => forecastcategoryname === 'Closed').reduce((sum, row) => sum + row.amount, 0);

      // Statistics Stages

      report.stages.total_number_Prospecting = finded.filter(item => item.stagename === 'Prospecting').length;
      report.stages.total_amount_Prospecting = finded.filter(({
        stagename
      }) => stagename === 'Prospecting').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ValueProposition = finded.filter(item => item.stagename === 'Value Proposition').length;
      report.stages.total_amount_ValueProposition = finded.filter(({
        stagename
      }) => stagename === 'Value Proposition').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NeedsAnalysis = finded.filter(item => item.stagename === 'Needs Analysis').length;
      report.stages.total_amount_NeedsAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Needs Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedWon = finded.filter(item => item.stagename === 'Closed Won').length;
      report.stages.total_amount_ClosedWon = finded.filter(({
        stagename
      }) => stagename === 'Closed Won').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_IdDecisionMakers = finded.filter(item => item.stagename === 'Id. Decision Makers').length;
      report.stages.total_amount_IdDecisionMakers = finded.filter(({
        stagename
      }) => stagename === 'Id. Decision Makers').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_NegotiationReview = finded.filter(item => item.stagename === 'Negotiation/Review').length;
      report.stages.total_amount_NegotiationReview = finded.filter(({
        stagename
      }) => stagename === 'Negotiation/Review').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_Qualification = finded.filter(item => item.stagename === 'Qualification').length;
      report.stages.total_amount_Qualification = finded.filter(({
        stagename
      }) => stagename === 'Qualification').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ProposalPriceQuote = finded.filter(item => item.stagename === 'Proposal/Price Quote').length;
      report.stages.total_amount_ProposalPriceQuote = finded.filter(({
        stagename
      }) => stagename === 'Proposal/Price Quote').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_PerceptionAnalysis = finded.filter(item => item.stagename === 'Perception Analysis').length;
      report.stages.total_amount_PerceptionAnalysis = finded.filter(({
        stagename
      }) => stagename === 'Perception Analysis').reduce((sum, row) => sum + row.amount, 0);

      report.stages.total_number_ClosedLost = finded.filter(item => item.stagename === 'Closed Lost').length;
      report.stages.total_amount_ClosedLost = finded.filter(({
        stagename
      }) => stagename === 'Closed Lost').reduce((sum, row) => sum + row.amount, 0);

      //Progress
      report.progress.total_number = finded.filter(item => item.dealprogress != 0).length;
      report.progress.total_amount = finded.filter(({
        dealprogress
      }) => dealprogress != 0).reduce((sum, row) => sum + row.dealprogress, 0);

      //Coaching
      report.coaching.total_number = finded.filter(item => item.dealcoaching != 0).length;
      report.coaching.total_amount = finded.filter(({
        dealcoaching
      }) => dealcoaching != 0).reduce((sum, row) => sum + row.dealcoaching, 0);



      //ManagerJdm
      const findedJdm = await ManagerJudgementModel.find().select('name');

      if (findedJdm.length != 0) {
        findedJdm.forEach(async jdm => {
          jdms.push(jdm.name)
          jdmsCount.push(finded.filter(item => item.managerjudgment === jdm.name).length);
          jdmsAmount.push(finded.filter(({
            managerjudgment
          }) => managerjudgment === jdm.name).reduce((sum, row) => sum + row.amount, 0));
        });
      }




    }


    /*    const {
         id
       } = req.params; */
    const FindedcountDocuments = await OpportunityModel.countDocuments({
      salesuser: id
    });

    res.status(200).json({
      success: true,
      totalOppos: FindedcountDocuments,
      data: finded,
      report: report,
      jdms: jdms,
      jdmsAmount: jdmsAmount,
      jdmsCount: jdmsCount

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
    const finded = await OpportunityModel
      .findById(id)
      .select('-__v -manageruser  -ai_predictions       ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },  
        {
          path: 'processflow',
          select: ('-__v -opportunity -createddate'),
          populate: {
            path: 'categories',
            select: ('-__v -createddate -processflow'),
            populate: {
              path: 'items',
              select: ('-__v -createddate -category'),
              populate: [{
                  path: 'messages',
                  select: ('-__v -item'),
                },
                {
                  path: 'options',
                  select: ('-__v -item'),
                },
              ]
            }
          }
        },

        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);


    console.log(parseInt(moment(finded?.closedate).month()) + 1)

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


exports.getByOriginId = async (req, res) => {
  const {
    id
  } = req.params;
  try {
    const finded = await OpportunityModel
      .find({
        idorigin: id
      })
      .select('-__v -manageruser  -ai_predictions       ')
      .populate([{
          path: 'account',
          select: ('name billingcountry'),
        },  

        {
          path: 'processflow',
          select: ('-__v -opportunity -createddate'),
          populate: {
            path: 'categories',
            select: ('-__v -createddate -processflow'),
            populate: {
              path: 'items',
              select: ('-__v -createddate -category'),
              populate: [{
                  path: 'messages',
                  select: ('-__v -item'),
                },
                {
                  path: 'options',
                  select: ('-__v -item'),
                },
              ]
            }
          }
        },

        {
          path: 'salesuser',
          select: ('_id firstname lastname username manageruser'),
          populate: {
            path: 'manageruser',
            select: ('_id firstname lastname username'),
          }
        }
      ]);




    //console.log("finded.discussions: " + finded.manageruser.processflow.categories[0]);


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

    const newOne = new OpportunityModel(data);
    newOne.salesuser = id; // <=== Assign salesuser id from param 
    console.log("salesuser " + newOne.salesuser);
    // newOne.manageruser = newOne.salesuser.manageruser; // <=== Assign manageruser id from salesuser

    const relatedOne = await SalesModel.findById({
      _id: newOne.salesuser
    });

    newOne.manageruser = relatedOne.manageruser; // <=== Assign manager 

    console.log("relatedManager id " + relatedOne.manageruser);

    // Related Manager 
    /*     const relatedManager = await ManagerModel
          .findById({
            _id: relatedOne.manageruser
          }); */


    //createBasedOnManagerID(relatedOne.manageruser);
    // GENERATION OF PROCESS FLOW

    // Related Manager 
    const relatedManager = await ManagerModel.findById({
        _id: newOne.manageruser
      }).select(' -__v')
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

    console.log("relatedManager   " + relatedManager);


    var duplicate = new ProcessFlowModel();
    duplicate.name = relatedManager.processflowtemplate.name;

    for (let category of relatedManager.processflowtemplate.categoriestemplate) {
      var cat = new CategoryModel();
      cat.name = category.name;
      cat.description = category.description;
      cat.processflow = newprocessflow;

      for (let item of category.itemstemplate) {
        var itm = new ItemModel();
        itm.name = item.name;
        itm.description = item.description;
        for (let option of item.optionstemplate) {
          var op = new OptionModel();
          op.name = option.name;
          var newop = await op.save();
          itm.options.push(newop);
        }
        var newitm = await itm.save();

        cat.items.push(newitm);
      }
      var newcat = await cat.save();

      duplicate.categories.push(newcat);

    }
    var newprocessflow = await duplicate.save();

    newOne.processflow = newprocessflow;
    console.log("processflow " + newprocessflow);


    /*   relatedOne.opportunities.push(newOne);
      await relatedOne.save(); */

    /* 
        relatedManager.opportunities.push(newOne);
        await relatedManager.save();
    */
    const oppo = await newOne.save();

    res.status(200).json({
      success: true,
      data: oppo
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
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);
    const finded = await OpportunityModel.findById(id);
    if (!finded) throw TypeError("Opportunity not found");

    const edited = await OpportunityModel.findByIdAndUpdate(id, {
      ...req.body
    });

    if (edited) {
      setTimeout(() => {
        signalsSynch();
        setTimeout(() => {
          actionsSynch();
          setTimeout(() => {
            predictionsSynch();
            setTimeout(() => {
              rollUpsSynch();
            }, 9000); //1.5min
          }, 9000); //1.5min
        }, 9000); //1.5min
      }, 3000); //1.5min
    }



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




/* 
exports.updateAmount = async (req, res) => {
  //data validator
  verifyData(res, req.body);
  const data = req.body;
  const {
    id
  } = req.params;
  try {
    var json;
    var towrite;
    var sendHeaders;
    const finded = await OpportunityModel.findById(id);
    if (finded) {
      // UpdateAmount CASE
      console.log('UpdateAmount CASE');
      let OppoUpdate = new opportunityUpdate({
        opportunityIdorigin: finded.idorigin,
        opportunity: finded._id
      });
      OppoUpdate.type = "UpdateAmount";
      OppoUpdate.lastValue = finded.amount;
      OppoUpdate.newValue = data.amount;
      // Take History Update
      const result = await OppoUpdate.save();
      //Lets Send Message Queue
      //console.log(finded.idorigin)
      json = {
        id: finded.idorigin,
        amount: OppoUpdate.newValue
      }
      towrite = JSON.stringify(json);
      sendHeaders = {
        'destination': '/queue/' + OppoUpdate.type + '',
        'content-type': 'text/plain'
      };
    }

    //updating Mongo
    const edited = await OpportunityModel.findByIdAndUpdate(id, data);
    if (edited) {
      // Sending Queue
      stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ")
      } else {
        console.log('connected ... Sending Queue');
        // console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();
      }
      });
    }

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
 */
/* 
async function takeHistoryLog(objLog) {
  try {
   
    logger.info(`takeHistoryLog in progress . . ${objLog.createddate} `);
         redshiftClient.connect(function(error){
          if(error) throw error;
          else{
            let sql = `INSERT INTO ${process.env.DB_SCHEMA}.opportunityhistorylog (id, accountid, opportunityid, createdbyid, createddate, description, stage, resource, lastvalue, newvalue, opportunity , account, resourcetype )
            VALUES ('${objLog.idorigin}', '${objLog.accountid}', '${objLog.opportunityid}', '${objLog.createdbyid}', '${objLog.createddate}' , '${objLog.description}', '${objLog.stage}' , '${objLog.resource}', '${objLog.lastvalue}', '${objLog.newvalue}', '${objLog.opportunity}' , '${objLog.account}' , '${objLog.resourcetype}'  )`;
            
            redshiftClient.query(sql, null, function(error, data){
              if(error) { 
                redshiftClient.close(); 
                throw error; 
              }else{
                //console.log(data);
                redshiftClient.close();
              }
            });
          }
        });


  } catch (error) {
    redshiftClient.close();
    throw Error(error);
  }
};
 */

async function takeHistoryLog(objLog) {
  try {
    console.log(`takeHistoryLog in progress . . ${objLog.createddate} `);
    //console.log(id) 
    let sql = `INSERT INTO ${process.env.DB_SCHEMA}.opportunityhistorylog (id, accountid, opportunityid, createdbyid, createddate, description, stage, resource, lastvalue, newvalue, opportunity , account, resourcetype )
VALUES ('${objLog.idorigin}', '${objLog.accountid}', '${objLog.opportunityid}', '${objLog.createdbyid}', '${objLog.createddate}' , '${objLog.description}', '${objLog.stage}' , '${objLog.resource}', '${objLog.lastvalue}', '${objLog.newvalue}', '${objLog.opportunity}' , '${objLog.account}' , '${objLog.resourcetype}'  )`;
    console.log(sql)
    await redshiftClient.query(sql, null);
    // do stuff with the eventual result and return something
  } catch (error) {
    throw Error(error);
  }
}

// do stuff with the eventual result and return something


exports.updateAmount = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const iduser = req.params.iduser;

    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const sendHeaders = {
      'destination': '/queue/UpdateAmount',
      'content-type': 'text/plain'
    };
    const finded = await OpportunityModel.findById(id); //.populate('account');
    if (!finded) throw TypeError("Opportunity not found");

    //Update directe
    const edited = await OpportunityModel.findByIdAndUpdate(id, {
      ...req.body
    });
    if (!edited) throw TypeError("Opportunity not edited");


    //take History
    var objLog = new RedshiftOpportunityHistoryLogModel();
    const uuid = uuidEmit();
    const timestamp = uuidParse(uuid);
    const shortuuid = short.generate().substring(1, 6)
    const generatedID = (`${timestamp}${shortuuid}`)
    // console.log(shortuuid);
    //console.log(timestamp); 
    // console.log(generatedID);
    objLog.idorigin = generatedID;

    objLog.accountid = finded.accountid;
    objLog.opportunityid = edited.idorigin;
    objLog.createdbyid = iduser;
    const dateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000");
    objLog.createddate = dateTime;
    objLog.description = "UpdateAmount";
    objLog.stage = edited.stagename;
    objLog.resource = '';
    objLog.resourcetype = '';
    objLog.lastvalue = finded.amount;
    objLog.newvalue = data.amount;
    objLog.opportunity = id;
    objLog.account = finded.account;
    await takeHistoryLog(objLog);


    // loadRollUp(finded.salesuser);
    setTimeout(() => {
      signalsSynch();
      setTimeout(() => {
        actionsSynch();
        setTimeout(() => {
          predictionsSynch();
          setTimeout(() => {
            rollUpsSynch();
          }, 6000); //1.5min
        }, 9000); //1.5min
      }, 9000); //1.5min
    }, 3000); //1.5min



    // Sending Queue

    stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ! " + error.message)
      } else {
        console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        const json = {
          id: finded.idorigin,
          amount: data.amount
        }
        const towrite = JSON.stringify(json);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();
      }
    });


    res.status(200).json({
      success: true,
      data: objLog
    });

  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};




exports.updateStageName = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const iduser = req.params.iduser
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const sendHeaders = {
      'destination': '/queue/UpdateStageQueue',
      'content-type': 'text/plain'
    };
    const finded = await OpportunityModel.findById(id); //.populate('account');
    if (!finded) throw TypeError("Opportunity not found");


    //Update directe
    const edited = await OpportunityModel.findByIdAndUpdate(id, {
      ...req.body
    });
    if (!edited) throw TypeError("Opportunity not edited");

    //take History
    var objLog = new RedshiftOpportunityHistoryLogModel();
    const uuid = uuidEmit();
    const timestamp = uuidParse(uuid);
    const shortuuid = short.generate().substring(1, 6)
    const generatedID = (`${timestamp}${shortuuid}`)
    objLog.idorigin = generatedID;
    objLog.accountid = finded.accountid;
    objLog.opportunityid = edited.idorigin;
    objLog.createdbyid = iduser;
    const dateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000");
    objLog.createddate = dateTime;
    objLog.description = "UpdateStage";
    objLog.stage = edited.stagename;
    objLog.resource = '';
    objLog.resourcetype = '';
    objLog.lastvalue = finded.stagename;
    objLog.newvalue = data.stagename;
    objLog.opportunity = id;
    objLog.account = finded.account;
    await takeHistoryLog(objLog);


    setTimeout(() => {
      signalsSynch();
      setTimeout(() => {
        actionsSynch();
        setTimeout(() => {
          predictionsSynch();
        }, 9000); //1.5min
      }, 9000); //1.5min
    }, 3000); //1.5min


    // Sending Queue
    stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ! " + error.message)
      } else {
        console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        const json = {
          id: finded.idorigin,
          name: "",
          stagename: data.stagename
        }
        const towrite = JSON.stringify(json);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();
      }
    });


    res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



exports.updateForecastCategoryName = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const iduser = req.params.iduser
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const sendHeaders = {
      'destination': '/queue/UpdateForecastCategory',
      'content-type': 'text/plain'
    };
    const finded = await OpportunityModel.findById(id); //.populate('account');
    if (!finded) throw TypeError("Opportunity not found");
    //Update directe
    const edited = await OpportunityModel.findByIdAndUpdate(id, {
      ...req.body
    });
    if (!edited) throw TypeError("Opportunity not edited");

    //take History
    var objLog = new RedshiftOpportunityHistoryLogModel();
    const uuid = uuidEmit();
    const timestamp = uuidParse(uuid);
    const shortuuid = short.generate().substring(1, 6)
    const generatedID = (`${timestamp}${shortuuid}`)
    objLog.idorigin = generatedID;
    objLog.accountid = finded.accountid;
    objLog.opportunityid = edited.idorigin;
    objLog.createdbyid = iduser;
    const dateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000");
    objLog.createddate = dateTime;
    objLog.description = "UpdateForecastCategory";
    objLog.stage = edited.stagename;
    objLog.resource = '';
    objLog.resourcetype = '';
    objLog.lastvalue = finded.forecastcategoryname;
    objLog.newvalue = data.forecastcategoryname;
    objLog.opportunity = id;
    objLog.account = finded.account;
    await takeHistoryLog(objLog);


    // loadRollUp(finded.salesuser);
    setTimeout(() => {
      signalsSynch();
      setTimeout(() => {
        actionsSynch();
        setTimeout(() => {
          predictionsSynch();
          setTimeout(() => {
            rollUpsSynch();
          }, 6000); //1.5min
        }, 9000); //1.5min
      }, 9000); //1.5min
    }, 3000); //1.5min

    // Sending Queue
    stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ! " + error.message)
      } else {
        console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        const json = {
          id: finded.idorigin,
          forecastcategory: data.forecastcategoryname
        }
        const towrite = JSON.stringify(json);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();
      }
    });


    res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

exports.updateNextStep = async (req, res) => {
  try {
    const data = req.body;
    const id = req.params.id;
    const iduser = req.params.iduser
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const sendHeaders = {
      'destination': '/queue/UpdateNextStep',
      'content-type': 'text/plain'
    };
    const finded = await OpportunityModel.findById(id); //.populate('account');
    if (!finded) throw TypeError("Opportunity not found");

    //Update directe
    const edited = await OpportunityModel.findByIdAndUpdate(id, {
      ...req.body
    });

    if (!edited) throw TypeError("Opportunity not edited");

    //take History
    var objLog = new RedshiftOpportunityHistoryLogModel();
    const uuid = uuidEmit();
    const timestamp = uuidParse(uuid);
    const shortuuid = short.generate().substring(1, 6)
    const generatedID = (`${timestamp}${shortuuid}`)
    objLog.idorigin = generatedID;
    objLog.accountid = finded.accountid;
    objLog.opportunityid = edited.idorigin;
    objLog.createdbyid = iduser;
    const dateTime = moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000");
    objLog.createddate = dateTime;
    objLog.description = "UpdateNextStep";
    objLog.stage = edited.stagename;
    objLog.resource = '';
    objLog.resourcetype = '';
    objLog.lastvalue = finded.nextstep;
    objLog.newvalue = data.nextstep;
    objLog.opportunity = id;
    objLog.account = finded.account;
    await takeHistoryLog(objLog);

    setTimeout(() => {
      signalsSynch();
      setTimeout(() => {
        actionsSynch();
        setTimeout(() => {
          predictionsSynch();
        }, 9000); //1.5min
      }, 9000); //1.5min
    }, 3000); //1.5min

    // Sending Queue
    stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ! " + error.message)
      } else {
        console.log('connected ... Sending Queue');
        // console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        const json = {
          id: finded.idorigin,
          nextstep: data.nextstep
        }
        const towrite = JSON.stringify(json);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();
      }
    });

    res.status(200).json({
      success: true
    });
  } catch (error) {
    logger.error(error.message)
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};



exports.updateCloseDate = async (req, res) => {
  try {

    const data = req.body;
    console.log(data.closedate)
    const id = req.params.id;
    const iduser = req.params.iduser
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const sendHeaders = {
      'destination': '/queue/UpdateClosingDateQueue',
      'content-type': 'text/plain'
    };
    const finded = await OpportunityModel.findById(id); //.populate('account');
    if (!finded) throw TypeError("Opportunity not found");
    //Update directly pushcount if closedate changed
    //console.log("finded.closedate ", finded.closedate);
    //console.log("data.closedate ", data.closedate); 
    if ((finded.closedate) && (data.closedate)) {
      var closedatemongo = moment(finded.closedate);
      var newclosedate = moment(data.closedate);
      if (monthDiff(closedatemongo, newclosedate)) {
        console.log("push count must be changed from " + finded.pushcount + " TO : " + (finded.pushcount + 1))
        let pc = (finded.pushcount + 1)
        await OpportunityModel.findByIdAndUpdate(id, {
          pushcount: pc
        });
      }

      //Update directly
      const edited = await OpportunityModel.findByIdAndUpdate(id, {
        ...req.body
      });

      if (!edited) throw TypeError("Opportunity not edited");

      //take History
      var objLog = new RedshiftOpportunityHistoryLogModel();
      const uuid = uuidEmit();
      const timestamp = uuidParse(uuid);
      const shortuuid = short.generate().substring(1, 6)
      const generatedID = (`${timestamp}${shortuuid}`)
      objLog.idorigin = generatedID;
      objLog.accountid = finded.accountid;
      objLog.opportunityid = edited.idorigin;
      objLog.createdbyid = iduser;
      const d = Date.now();
      const dateTime = moment(d).format("YYYY-MM-DD HH:mm:ss.000");
      objLog.createddate = dateTime;
      objLog.description = "UpdateClosingDate";
      objLog.stage = edited.stagename;
      objLog.resource = '';
      objLog.resourcetype = '';
      objLog.lastvalue = finded.closedate;
      objLog.newvalue = data.closedate;
      objLog.opportunity = id;
      objLog.account = finded.account;
      await takeHistoryLog(objLog);


      setTimeout(() => {
        signalsSynch();
        setTimeout(() => {
          actionsSynch();
          setTimeout(() => {
            predictionsSynch();
          }, 9000); //1.5min
        }, 9000); //1.5min
      }, 3000); //1.5min

    }


    // Sending Queue
    stompit.connect(connectOptions, async function (error, client) {
      if (error) {
        console.log("cannot connect to Active MQ! " + error.message)
      } else {
        console.log('connected ... Sending Queue');

        // console.log('connected ... Sending Queue');
        var frame = client.send(sendHeaders);
        const json = {
          id: finded.idorigin,
          name: "",
          closingdate: data.closedate
        }
        const towrite = JSON.stringify(json);
        console.log(towrite)
        frame.write(towrite);
        frame.end();
        client.disconnect();

      }

    });


    res.status(200).json({
      success: true
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
    if (!ObjectID.isValid(req.params.id)) throw TypeError("ID not valid : " + req.params.id);

    const deleted = await OpportunityModel.findById(id);
    if (deleted) deleted.remove();

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


const generalSynch = async () => {
  try {
    console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General synchronization is started . . .`)
    let res = await axios.post(`${process.env.AUTOSYNCH_URL_PROD}/synch/`);
    // Work with the response...
    console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General Sync works properly !`)
  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")} - General Sync not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")} - General Sync Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)
    } else {
      // Anything else
      console.log(`${ moment(Date.now()).format("YYYY-MM-DD HH:mm:ss.000")}  - General Sync not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};

const signalsSynch = async () => {
  try {
    logger.info(`Signals synchronization is started . . .`)
    let res = await axios.post(
      `${process.env.AUTOSYNCH_URL_PROD}/signal_mr/load/go`
    );
    // Work with the response...
    logger.info(`Signals Sync works properly !`)
  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Signals Sync not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      logger.error(`Signals Sync Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)
    } else {
      // Anything else
      logger.error(`Signals Sync not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};

const actionsSynch = async () => {
  try {
    logger.info(`Actions synchronization is started . . .`)
    let res = await axios.post(
      `${process.env.AUTOSYNCH_URL_PROD}/action_mr/load/go`
    );
    // Work with the response...
    logger.info(`Actions Sync works properly !`)
  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Actions Sync not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      logger.error(`Actions Sync Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)
    } else {
      // Anything else
      logger.error(`Actions Sync not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};

const predictionsSynch = async () => {
  try {
    logger.info(`Predictions synchronization is started . . .`)
    let res = await axios.get(
      `${process.env.AUTOSYNCH_URL_PROD}/ai_prediction/load/go`
    );
    // Work with the response...
    logger.info(`Predictions Sync works properly !`)
  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`Predictions Sync not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      logger.error(`Predictions Sync Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)
    } else {
      // Anything else
      logger.error(`Predictions Sync not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};

const rollUpsSynch = async () => {
  try {
    logger.info(`RollUps gathering is started `);
    let res = await axios.post(
      `${process.env.AUTOSYNCH_URL_PROD}/rollup/load/go`
    );
    // Work with the response...
    logger.info(`RollUps gathering works properly !`)

  } catch (err) {
    if (err.response) {
      // The client was given an error response (5xx, 4xx)      
      logger.error(`RollUps gathering  not works - sync api return an error response !-- Details: ${err.message} `)

    } else if (err.request) {
      // The client never received a response, and the request was never left
      logger.error(`RollUps gathering Not works -  The api never received a response from sync api, and the request was never left ! -- Details: ${""+err.message}`)

    } else {
      // Anything else
      logger.error(`RollUps gathering not works - unknown error ! -- Details: ${err.message} `)
    }
  }
};