const mongoose = require("mongoose"); 

const {
  Schema
} = mongoose;
const opportunityUpdateSchema = new Schema({

  type: {
    type: String,
  },

  lastValue: {
    type: String,
  },

  newValue: {
    type: String,
  },

  createddate: {
    type: Date,
    default: Date.now(),
  },

  createdby: {
    type: String,
  },

  opportunityIdorigin: {
    type: String,
  },

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  }

});


const opportunityUpdateModel = mongoose.model("opportunityUpdate", opportunityUpdateSchema);
module.exports = opportunityUpdateModel;