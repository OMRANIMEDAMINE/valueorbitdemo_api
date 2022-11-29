const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const opportunitySchema = new Schema({
  idorigin: {
    type: Schema.Types.ObjectId,
  },

  description: {
    type: String,
  },

  accountid: {
    type: Schema.Types.ObjectId,
  },

  amount: {
    type: Number,
  },

  closedate: {
    type: Date,
  },

  contactid: {
    type: Schema.Types.ObjectId,
  },

  createdbyid: {
    type: Schema.Types.ObjectId,
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

  fiscalperiod: {
    type: Number,
  },
  forecastcategory: {
    type: String,
  },
  forecastcategoryname: {
    type: String,
  },
  hasopenactivity: {
    type: Boolean,
  },
  hasoverduetask: {
    type: Boolean,
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
  lastactivitydate: {
    type: Date,
  },
  lastamountchangedhistoryid: {
    type: Schema.Types.ObjectId,
  },
  lastclosedatechangedhistoryid: {
    type: Schema.Types.ObjectId,
  },
  lastmodifiedbyid: {
    type: Schema.Types.ObjectId,
  },
  lastmodifieddate: {
    type: Date,
  },

  lastreferenceddate: {
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
  name: {
    type: String,
  },
  nextstep: {
    type: String,
  },

  ownerid: {
    type: Schema.Types.ObjectId,
  },

  pricebook2id: {
    type: Number,
  },

  probability: {
    type: Number,
  },

  pushcount: {
    type: Number,
  },

  stagename: {
    type: String,
  },

  systemmodstamp: {
    type: Date,
  },

  type: {
    type: String,
  },


  fiscalmonth: {
    type: Number,
  },
  forecastHealthCheck: {
    type: Schema.Types.ObjectId,
    ref: "forecastHealthCheck",
  },

  /*  account: {
    type: Schema.Types.ObjectId,
    ref: "account",
  },
*/
  processflows: [{
    type: Schema.Types.ObjectId,
    ref: "processflow",
  }, ],


});

const opportunityModel = mongoose.model("opportunity", opportunitySchema);
module.exports = opportunityModel;