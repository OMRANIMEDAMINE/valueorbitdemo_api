const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const itemTemplateSchema = new Schema({

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  createddate: {
    type: Date,
    default: Date.now(),
  },
  
  categorytemplate: {
    type: Schema.Types.ObjectId,
    ref: 'categorytemplate'
  },

  /* discussions: [{
    type: Schema.Types.ObjectId,
    ref: "discussion",
  }],
 */

  optionstemplate: [{
    type: Schema.Types.ObjectId,
    ref: "optiontemplate",
  }],



});

const itemTemplateModel = mongoose.model("itemtemplate", itemTemplateSchema);
module.exports = itemTemplateModel;