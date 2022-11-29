const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const dealBandSchema = new Schema({

  
  name: {
    type: String,
  },
  
  min: {
    type: Number,
  },
 
  max: {
    type: Number,
  }
 

});


const dealBandModel = mongoose.model("dealband", dealBandSchema);
module.exports = dealBandModel;