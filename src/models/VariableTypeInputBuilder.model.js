const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const VariableTypeInputBuilderSchema = new Schema({

  name: {
    type: String
  },

  label: {
    type: String
  },
  
 input_type: {
    type: String
  },
 
  variabletypebuilder: {
    type: String,
    ref: "variabletypebuilder"
  },
  

}
);

const variableTypeInputBuilderModel = mongoose.model("variabletypeinputbuilder", VariableTypeInputBuilderSchema);

module.exports = variableTypeInputBuilderModel;