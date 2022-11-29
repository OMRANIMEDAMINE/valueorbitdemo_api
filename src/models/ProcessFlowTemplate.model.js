const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const processFlowTemplateSchema = new Schema({

  name: {
    type: String,
  },

  description: {
    type: String,
  },
  
  categoriestemplate: [{
    type: Schema.Types.ObjectId,
    ref: "categorytemplate",
  }, ],

  managerusers: [{
    type: Schema.Types.ObjectId,
    ref: "manageruser",
  }, ],

});

const processFlowTemplateModel = mongoose.model("processflowtemplate", processFlowTemplateSchema);
module.exports = processFlowTemplateModel;