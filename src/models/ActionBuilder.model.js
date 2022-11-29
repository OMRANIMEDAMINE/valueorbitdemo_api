const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const ActionBuilderSchema = new Schema({

  name: {
    type: String,
  },

  label: {
    type: String,
  },

  actionparamsbuilder: [{
    type: Schema.Types.ObjectId,
    ref: "actionparamsbuilder",
  }]


}, {
  strict: false
});

const actionBuilderModel = mongoose.model("actionbuilder", ActionBuilderSchema);

module.exports = actionBuilderModel;