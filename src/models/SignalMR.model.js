const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const SignalMRSchema = new Schema({
  _id:{
    type: String,
  },

  idorigin: {
    type: String,
  },

  category: {  
    type: String,
  },

  oppId: {
    type: String,
  },

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  },

  salesId: {
    type: String,
  },


  sales: {
    type: Schema.Types.ObjectId,
    ref: "salesuser",
  },

  managerId: {
    type: String,
  },


  manager: {
    type: Schema.Types.ObjectId,
    ref: "manageruser",
  },

  createddate: {
    type: Date,
  },

  fiscalyear: {
    type: Number,
  },

  fiscalquarter: {
    type: Number,
  },

  fiscalmonth: {
    type: Number,
  },

  signal: {
    type: String,
  },

  type: {
    type: String,
  },
 
  value: {
    type: Number,
  },

  isFlagged: {
    type: Boolean,
    default: false,
  },

  isDeleted: {
    type: Boolean,
    default: false,
  },

  isSnoozed: {
    type: Boolean,
    default: false,
  },

  isIgnored: {
    type: Boolean,
    default: false,
  },

  isDone: {
    type: Boolean,
    default: false,
  },
  
  actions_id: [{
    type: String,
    ref: "actionMR",
  }],
 

});

const SignalMRModel = mongoose.model("signalMR", SignalMRSchema);
module.exports = SignalMRModel;