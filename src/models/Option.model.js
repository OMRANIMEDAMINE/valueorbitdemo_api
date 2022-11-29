const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const optionSchema = new Schema({

  name: {
    type: String,
  },

  type: {
    type: String,
  },

  values: [{
    type: String,
  }],
  
  item: {
    type: Schema.Types.ObjectId,
    ref: 'item'
  }
  

});

const optionModel = mongoose.model("option", optionSchema);
module.exports = optionModel;