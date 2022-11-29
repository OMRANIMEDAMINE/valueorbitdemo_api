const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const itemSchema = new Schema({

  createddate: {
    type: Date,
    default: Date.now(),
  },
  
  name: {
    type: String,
  },

  description: {
    type: String,
  },

  category: {
    type: Schema.Types.ObjectId,
    ref: 'category'
  },

  options: [{
    type: Schema.Types.ObjectId,
    ref: "option",
  }],

  isopinongived: {
    type: Boolean,
    default: false,
  },
  issalesfeelgived: {
    type: Boolean,
    default: false,
  },

  manageropinion: {
    type: Number,
    default: 1,
  },

  manageropiniongiveddate: {
    type: Date,
    default: null,
  },

  salesfeelgiveddate: {
    type: Date,
    default: null,
  },

  salesfeel: {
    type: Number,
    default: 1,
  },

  messages: [{
    type: Schema.Types.ObjectId,
    ref: "message",
  }],

  itemupdates: [{
    type: Schema.Types.ObjectId,
    ref: "itemupdate",
  }]


  


});

const itemModel = mongoose.model("item", itemSchema);
module.exports = itemModel;