const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const targetSchema = new Schema({

  value: {
    type: Number
  },

  periodtype: {
    type: String, //monthly quarterly yearly
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

  comment: {
    type: String
  },

  createddate: {
    type: Date
  },
  createdbyid: {
    type: String
  },
  lastmodifieddate: {
    type: Date
  },
  lastmodifiedbyid: {
    type: String
  },

});

const targetModel = mongoose.model("target", targetSchema);
module.exports = targetModel;