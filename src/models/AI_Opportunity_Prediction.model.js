const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const ai_opportunity_prediction_Schema = new Schema({
  
  estimatedCloseDate: {
    type: String,
  },

  opp_id: {
    type: String,
  },

  risk: {
    type: String,
  },

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  }

 /*  ai_prediction: {
    type: Schema.Types.ObjectId,
    ref: "ai_prediction",
  } */


});
const ai_opportunity_predictionModel = mongoose.model("ai_opportunity_prediction", ai_opportunity_prediction_Schema);
module.exports = ai_opportunity_predictionModel;