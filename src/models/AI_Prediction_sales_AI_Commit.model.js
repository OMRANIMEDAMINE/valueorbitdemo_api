 
const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
 const ai_prediction_sales_ai_commit_Schema = new Schema({
  
  ai_commit: {
    type: Number,
  },

  sales_id: {
    type: String,
  },

  salesuser: {
    type: Schema.Types.ObjectId,
    ref: "salesuser",
  },

});

const ai_prediction_sales_ai_commit_Model = mongoose.model("ai_prediction_sales_ai_commit", ai_prediction_sales_ai_commit_Schema);
module.exports = ai_prediction_sales_ai_commit_Model;