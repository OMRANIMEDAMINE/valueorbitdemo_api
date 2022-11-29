const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const fiscalyearSchema = new Schema({

  /* fiscalyear: {
    type: Number
  }, */
  
  startmonth: {
    type: Number
  },

/*   year: {
    type: Number
  }, */
 
  createddate: {
    type: Date
  },

  lastmodifieddate: {
    type: Date
  },


});

const fiscalyearSchemaModel = mongoose.model("fiscalyear", fiscalyearSchema);
module.exports = fiscalyearSchemaModel;