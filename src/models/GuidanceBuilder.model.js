const mongoose = require("mongoose");
const {
  Schema
} = mongoose;


const GuidanceBuilderSchema = new Schema({

  name: {
    type: String,
  },

  label: {
    type: String,
  },

  guidanceparamsbuilder: [{
    type: Schema.Types.ObjectId,
    ref: "guidanceparamsbuilder",
  }]


}, {
  strict: false
});

const guidanceBuilderModel = mongoose.model("guidancebuilder", GuidanceBuilderSchema);

module.exports = guidanceBuilderModel;