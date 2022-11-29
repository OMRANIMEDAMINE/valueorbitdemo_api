const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const categoryTemplateSchema = new Schema({

  name: {
    type: String,
  },

  description: {
    type: String,
  },


  processflowtemplate: {
    type: Schema.Types.ObjectId,
    ref: "processflowtemplate",
  },


  itemstemplate: [{
    type: Schema.Types.ObjectId,
    ref: "itemtemplate",
  }, ]



});

const categoryTemplateModel = mongoose.model("categorytemplate", categoryTemplateSchema);
module.exports = categoryTemplateModel;