const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const opportunityStageSchema = new Schema({

  idorigin: {
    type: String,
  },

  description: {
    type: String,
  },

   
  isactive: {
    type: Boolean,
  },

  apiname: {
    type: String,
  },

  masterlabel: {
    type: String,
  },

  sortorder: {
    type: Number,
  },

  forecastcategory: {
    type: String,
  },

  forecastcategoryname: {
    type: String,
  },

  defaultprobability: {
    type: Number,
  },

  createdbyid: {
    type: String,
  },

  createddate: {
    type: Date,
  },

  lastmodifiedbyid: {
    type: String,
  },


  lastmodifieddate: {
    type: Date,
  },

  

  systemmodstamp: {
    type: Date,
  }
   


});

 




 



const opportunityStageModel = mongoose.model("opportunitystage", opportunityStageSchema);
module.exports = opportunityStageModel;