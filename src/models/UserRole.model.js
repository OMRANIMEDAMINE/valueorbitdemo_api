const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const userRoleSchema = new Schema({

  idorigin: {
    type: String,
  },

  name: {
    type: String,
  } 

});
const userRoleModel = mongoose.model("userrole", userRoleSchema);

module.exports = userRoleModel;
