 
 
const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
 const ai_prediction_manager_ai_commit_Schema = new Schema({
 
  ai_commit: {
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

const ai_prediction_manager_ai_commit_Model = mongoose.model("ai_prediction_manager_ai_commit", ai_prediction_manager_ai_commit_Schema);
module.exports = ai_prediction_manager_ai_commit_Model;