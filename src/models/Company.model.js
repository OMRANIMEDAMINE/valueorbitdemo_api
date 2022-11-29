const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const companySchema = new Schema({

  idorigin: {
    type: String,
  },

  name: {
    type: String,
  },

  description: {
    type: String,
  },

  phone: {
    type: String,
  },

/*   members: [{
    type: Schema.Types.ObjectId,
    ref: "member",
  }, ],

  accounts: [{
    type: Schema.Types.ObjectId,
    ref: "account",
  }, ],
 */


  

});
const companytModel = mongoose.model("company", companySchema);

module.exports = companytModel;

/* ,
  forecast: {
    type: Schema.Types.ObjectId,
    ref: "forecast_health_check",
  }, */

/*  unuseful fields*/
/*   shippingaddress: {
    type: String,
  },

  isdeleted: {
    type: Boolean,
  },
  lastactivitydate: {
    type: Date,
  },
  lastmodifiedbyid: {
    type: String,
  },
  lastmodifieddate: {
    type: Date,
  },
  lastvieweddate: {
    type: Date,
  }, */