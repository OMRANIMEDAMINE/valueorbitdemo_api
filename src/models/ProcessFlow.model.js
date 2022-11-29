const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const processFlowSchema = new Schema({

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  percentage: {
    type: Number,
  },

  createddate: {
    type: Date,
    default: Date.now(),
  },
  
  createdbyid: {
    type: Object,
  },


  isclosed: {
    type: Boolean,
  },


  closedate: {
    type: Date,
  },

 
  categories: [{
    type: Schema.Types.ObjectId,
    ref: "category",
  }, ],

  

});

const processFlowModel = mongoose.model("processflow", processFlowSchema);
module.exports = processFlowModel;