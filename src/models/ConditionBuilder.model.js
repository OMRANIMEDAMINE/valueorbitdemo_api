const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const ConditionBuilderSchema = new Schema({
  owneridorigin: {
    type: String,
  },
  name: {
    type: String,
  },
  createddate: {
    type: Date,
  },
  context: {
    type: String,
  },
  
}, {
  strict: false
});

const conditionBuilderModel = mongoose.model("conditionbuilder", ConditionBuilderSchema);
module.exports = conditionBuilderModel;