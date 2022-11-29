const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const itemUpdateSchema = new Schema({

  createddate: {
    type: Date,
    default: Date.now(),
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

  item: {
    type: Schema.Types.ObjectId,
    ref: "item",
  },

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  },

});

const itemUpdateModel = mongoose.model("itemupdate", itemUpdateSchema);
module.exports = itemUpdateModel;