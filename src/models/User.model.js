const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const userSchema = new Schema({

  idorigin: {
    type: String,
  },

  name: {
    type: String,
  },
  firstname: {
    type: String,
  },

  lastname: {
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
  username: {
    type: String,
  },

  password: {
    type: String,
  },


  createddate: {
    type: Date
  },

  lastmodifieddate: {
    type: Date
  },

  userrole: {
    type: Schema.Types.ObjectId,
    ref: "userrole",
  },

  managerid: {
    type: String,
  },

  sales: [{
    type: Schema.Types.ObjectId,
    ref: "user",
  }]

 

});
const userModel = mongoose.model("user", userSchema);

module.exports = userModel;