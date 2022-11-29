 
const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
 const ai_prediction_sales_ai_best_case_Schema = new Schema({
  
  ai_best_case: {
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

const ai_prediction_sales_ai_best_case_Model = mongoose.model("ai_prediction_sales_ai_best_case", ai_prediction_sales_ai_best_case_Schema);
module.exports = ai_prediction_sales_ai_best_case_Model;