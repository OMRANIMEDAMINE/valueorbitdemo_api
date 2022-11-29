const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const rollUp_Schema = new Schema({
  
  commit: {
    type: Number,
  },

  best_case: {
    type: Number,
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
  
  createddate: {
    type: Date,
  },

  sales: {
    type: Schema.Types.ObjectId,
    ref: 'sales'  
  },

});
const rollUpModel = mongoose.model("rollUp", rollUp_Schema);
module.exports = rollUpModel;