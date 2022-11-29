 
 const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
 const ai_prediction_manager_ai_best_case_Schema = new Schema({
  
  ai_best_case: {
    type: Number,
  },

  manager_id: {
    type: String,
  },

  manageruser: {
    type: Schema.Types.ObjectId,
    ref: "manageruser",
  },

});

const ai_prediction_manager_ai_best_case_Model = mongoose.model("ai_prediction_manager_ai_best_case", ai_prediction_manager_ai_best_case_Schema);
module.exports = ai_prediction_manager_ai_best_case_Model;