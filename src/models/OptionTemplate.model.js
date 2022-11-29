const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const optionTemplateSchema = new Schema({

  name: {
    type: String,
  },

  type: {
    type: String,
  },


  values: [{
    type: String,
  }],

  itemtemplate: {
    type: Schema.Types.ObjectId,
    ref: 'itemtemplate'
  }
  
});

const optionTemplateModel = mongoose.model("optiontemplate", optionTemplateSchema);
module.exports = optionTemplateModel;