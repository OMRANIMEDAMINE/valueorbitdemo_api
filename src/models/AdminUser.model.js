const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const adminUserSchema = new Schema({

  idorigin: {
    type: String,
  },

  firstname: {
    type: String,
  },

  lastname: {
    type: String,
  },

  username: {
    type: String,
  },
  password: {
    type: String,
  },


});


const adminUserModel = mongoose.model("adminuser", adminUserSchema);

module.exports = adminUserModel;