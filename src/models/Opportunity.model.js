const mongoose = require("mongoose");
const AI_PredictionModel = require("../models/AI_Prediction.model");
const ProcessFlowModel = require("../models/ProcessFlow.model");
const ProcessFlowTemplateModel = require("../models/ProcessFlowTemplate.model");

const SalesModel = require("../models/SalesUser.model");
const ManagerModel = require("../models/ManagerUser.model");

const CategoryModel = require("../models/Category.model");
const ItemModel = require("../models/Item.model");
const OptionModel = require("../models/Option.model");
const {
  Schema
} = mongoose;
const opportunitySchema = new Schema({

  idorigin: {
    type: String,
  },

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  amount: {
    type: Number,
  },

  closedate: {
    type: Date,
  },

  contactid: {
    type: String,
  },

  createdbyid: {
    type: String,
  },

  createddate: {
    type: Date,
  },

  fiscalquarter: {
    type: Number,
  },

  fiscalyear: {
    type: Number,
  },
 

  forecastcategory: {
    type: String,
  },
  forecastcategoryname: {
    type: String,
  },
 
  isclosed: {
    type: Boolean,
  },
  isdeleted: {
    type: Boolean,
  },
  iswon: {
    type: Boolean,
  },
  isprivate: {
    type: Boolean,
  },
 
  lastmodifiedbyid: {
    type: String,
  },
  lastmodifieddate: {
    type: Date,
  },
 

  laststagechangedate: {
    type: Date,
  },

  lastvieweddate: {
    type: Date,
  },

  leadsource: {
    type: String,
  },
 
  nextstep: {
    type: String,
  },

  ownerid: {
    type: String,
  },

  managerjudgment: {
    type: String,
    default: 'Pipeline'
  },

  pricebook2id: {
    type: Number,
  },

  probability: {
    type: Number,
  },

  pushcount: {
    type: Number,
    default: 0,

  },

  risk: {
    type: Number,
    default: 0,

  },
  
  estimatedCloseDate: {
    type: Date,
  },
  
  stagename: {
    type: String,
  },

/*   systemmodstamp: {
    type: Date,
  }, */

  type: {
    type: String,
  },

 fiscalmonth: {
    type: Number,
  },

  accountid: {
    type: String,
  },


  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },

  dealprogress: {
    type: Number,
    default: 0,
  },

  dealcoaching: {
    type: Number,
    default: 0,
  },

  
  ai_predictions: [{
    type: Schema.Types.ObjectId,
    ref: "ai_prediction",
  }, ],

  salesuser: {
    type: Schema.Types.ObjectId,
    ref: "salesuser",
  },

/*   rowid: {
    type: Number,
  },
 */
  
  manageruser: {
    type: Schema.Types.ObjectId,
    ref: "manageruser",
  },


  processflow: {
    type: Schema.Types.ObjectId,
    ref: "processflow",
  },

   
  notes: [{
    type: Schema.Types.ObjectId,
    ref: "note",
  },]
  

});





const opportunityModel = mongoose.model("opportunity", opportunitySchema);
module.exports = opportunityModel;