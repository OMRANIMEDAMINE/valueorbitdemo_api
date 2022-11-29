const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const opportunityHistoryLogSchema = new Schema({
 
  idorigin: {
    type: String,
  },

  accountid: {
    type: String,
  },
  opportunityid: {
    type: String,
  },

  createdbyid: {
    type: String,
  },

  createddate: {
    type: String,
  },

  description: {
    type: String,
  },

  stage: {
    type: String,
  },

  resource: {
    type: String,
  },

  resourcetype: {
    type: String,
  },

  lastvalue: {
    type: String,
  },

  newvalue: {
    type: String,
  },

  opportunity: {
    type: String,
  },

  account: {
    type: String,
  },
});

const opportunityHistoryLogModel= mongoose.model("opportunityhistorylog", opportunityHistoryLogSchema);
module.exports = opportunityHistoryLogModel;