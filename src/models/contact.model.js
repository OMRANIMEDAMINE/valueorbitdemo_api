const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const contactSchema = new Schema({

  idorigin: {
    type: String,
  },

  accountid: {
    type: String,
  },

  ownerid: {
    type: String,
  },


  lastname: {
    type: String,
  },

  firstname: {
    type: String,
  },

  salutation: {
    type: String,
  },

  name: {
    type: String,
  },

  phone: {
    type: String,
  },

  fax: {
    type: String,
  },
 
  mobilephone: {
    type: String,
  },

  title: {
    type: String,
  },

  email: {
    type: String,
  },

  department: {
    type: String,
  }

 
});
const contactModel = mongoose.model("contact", contactSchema);

module.exports = contactModel;