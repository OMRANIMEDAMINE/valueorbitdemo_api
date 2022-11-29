const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const ActionParamsBuilderSchema = new Schema({

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

const actionParamsBuilderModel = mongoose.model("actionparamsbuilder", ActionParamsBuilderSchema);

module.exports = actionParamsBuilderModel;

 