const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const accountSchema = new Schema({

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

  type: {
    type: String,
  },
  
  ownerid: {
    type: String,
  },

  owner: {
    type: String,
  },

  
  billingaddress: {
    type: String,
  },


  billingstate: {
    type: String,
  },

  billingcountry: {
    type: String,
  },

  website: {
    type: String,
  }, 
  createddate: {
    type: Date
  },


  opportunities: [{
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  },]
});
const accountModel = mongoose.model("account", accountSchema);

module.exports = accountModel;

/* ,
  forecast: {
    type: Schema.Types.ObjectId,
    ref: "forecast_health_check",
  }, */


/*   login: {
    type: String,
  },

  password: {
    type: String,
  },
 */
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


/*  members: {
   type: Schema.Types.ObjectId,
   ref: "members",
 },
 members: [{
   type: Schema.Types.ObjectId,
   ref: "members",
 }, ], */