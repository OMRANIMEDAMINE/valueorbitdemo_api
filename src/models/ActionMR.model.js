const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const ActionMRSchema = new Schema({

  _id:{
    type: String,
  },
 
  
  idorigin: {
    type: String,
  },

  category: { //global / sales/oppo/manager
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

  action: {
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

 
  signal_ids: [{
    type: String,
    ref: "signalMR",
  }],

});

const ActionMRModel = mongoose.model("actionMR", ActionMRSchema);
module.exports = ActionMRModel;