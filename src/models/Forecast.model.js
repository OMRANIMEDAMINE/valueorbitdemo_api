const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const forecastSchema = new Schema({

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

  forecastcategoryname: {
    type: String,
  },

  forecasttype: {
    type: String,
    default: "period",

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

const forecastModel = mongoose.model("forecast", forecastSchema);
module.exports = forecastModel;