const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const categorySchema = new Schema({

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  feel: {
    type: Number,
  },

  result: {
    type: Number,
  },

  percentage: {
    type: Number,
  },

  createddate: {
    type: Date,
    default: Date.now(),
  },
  

  createdby: {
    type: String,
  },


  isclosed: {
    type: Boolean,
  },


  closedate: {
    type: Date,
  },


  processflow: {
    type: Schema.Types.ObjectId,
    ref: "processflow",
  },
 

  items: [{
    type: Schema.Types.ObjectId,
    ref: "item",
  }, ],

  dealprogress: {
    type: Number,
    default: 0,
  },

  dealcoaching: {
    type: Number,
    default: 0,
  }

});

const categoryModel = mongoose.model("category", categorySchema);
module.exports = categoryModel;