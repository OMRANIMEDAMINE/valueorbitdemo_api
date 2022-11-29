const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const VariableBuilderSchema = new Schema({
 
  _id: {
    type: String
  },

  name: {
    type: String
  },

  label: {
    type: String
  },

  context: {
    type: String
  },


  field_type: {
    type: String
  },
  

  options: {
    type: [String]
  },
  
  htmlinput: {
    type: String
  },

  variabletypebuilder: {
    type: String,
    ref: "variabletypebuilder"
  },

  

});

const variableBuilderModel = mongoose.model("variablebuilder", VariableBuilderSchema);

module.exports = variableBuilderModel;