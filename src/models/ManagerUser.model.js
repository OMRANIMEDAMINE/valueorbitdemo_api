const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const managerUserSchema = new Schema({

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

  
  userroleid: {
    type: String,
  },
/* 
  managerid: {
    type: String,
  },
 */

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

  userrole: {
    type: Schema.Types.ObjectId,
    ref: "userrole",
  },

  salesusers: [{
    type: Schema.Types.ObjectId,
    ref: "salesuser",
  }, ],

  processflowtemplate:{
    type: Schema.Types.ObjectId,
    ref: "processflowtemplate",
  },

    
 
});
/* 
managerUserSchema.pre('remove', async function (next) {
  try {
    //console.log("called remove")
    await SalesModel.deleteMany({
      "_id": {
        $in: this.salesusers
      }
    });
    next();
  } catch (err) {
    next(err);
  }

}); */
const managerUserModel = mongoose.model("manageruser", managerUserSchema);
module.exports = managerUserModel;