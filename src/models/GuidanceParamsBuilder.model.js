const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const GuidanceParamsBuilderSchema = new Schema({

  label: {
    type: String,
  },

  name: {
    type: String,
  },

  fieldType: {
    type: String,
  },
  
 
}, {
  strict: false
});

const guidanceParamsBuilderModel = mongoose.model("guidanceparamsbuilder", GuidanceParamsBuilderSchema);

module.exports = guidanceParamsBuilderModel;

 