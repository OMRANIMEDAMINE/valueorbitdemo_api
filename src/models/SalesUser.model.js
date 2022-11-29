const mongoose = require("mongoose");
const OpportunityModel = require("../models/Opportunity.model");

const {
  Schema
} = mongoose;

const salesUserSchema = new Schema({

  
  idorigin: {
    type: String,
  },

  username: {
    type: String,
  },

  password: {
    type: String,
  },

  firstname: {
    type: String,
  },

  lastname: {
    type: String,
  },

  name: {
    type: String,
  },

  companyname: {
    type: String,
  },

  email: {
    type: String,
  },

  mobilephone: {
    type: String,
  },

  timezonesidkey: {
    type: String,
  },

  fullphotourl: {
    type: String,
  },
 
  createddate: {
    type: Date,
    default: Date.now(),
  },

  userroleid: {
    type: String,
  },

  managerid: {
    type: String,
  },
 
  userrole: {
    type: Schema.Types.ObjectId,
    ref: "userrole",
  },

  manageruser: {
    type: Schema.Types.ObjectId,
    ref: 'manageruser'
  },

  
  opportunities: [{
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  }, ], 


});

/* 
salesUserSchema.pre('remove', async function (next) {
  try {
    //console.log("called remove")
    await OpportunityModel.deleteMany({
      "_id": {
        $in: this.opportunities
      }
    });
    next();
  } catch (err) {
    next(err);
  }
}); */

const salesUserModel = mongoose.model("salesuser", salesUserSchema);
module.exports = salesUserModel;