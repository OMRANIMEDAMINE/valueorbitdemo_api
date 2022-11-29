const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const messageSchema = new Schema({

  createddate: {
    type: Date
  },


  createdby: {
    type: String,
  },

  isrequest: {
    type: Boolean,
  },

  type: {
    type: String,
  },

  value: {
    type: String,
  },

  note: {
    type: String,
  },

  item: {
    type: Schema.Types.ObjectId,
    ref: "item",
  },

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  },

  file: {
    type: Schema.Types.ObjectId,
    ref: "file",
    default: null,

  },

});

  
 
const messageModel = mongoose.model("message", messageSchema);
module.exports = messageModel;