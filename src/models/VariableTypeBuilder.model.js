const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const VariableTypeBuilderSchema = new Schema({
  _id: {
    type: String
  },

  variabletypeinputbuilder: [{
    type: String,
    ref: "variabletypeinputbuilder",
  }],

});

const variableTypeBuilderModel = mongoose.model("variabletypebuilder", VariableTypeBuilderSchema);

module.exports = variableTypeBuilderModel;