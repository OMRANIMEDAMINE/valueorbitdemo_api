const mongoose = require("mongoose");
const {
  Schema
} = mongoose;

const noteSchema = new Schema({

  idorigin: {
    type: String,
  },
/*    
  type: {
    type: String,
  }, */

  title: {
    type: String,
  },

  body: {
    type: String,
  },

  isprivate: {
    type: Boolean,
  },
 
  createddate: {
    type: Date,
  },   
  
  createdby: {
    type: String,
  }, 

  lastvalue: {
    type: String,
  }, 

  newvalue: {
    type: String,
  },

/*   iditem: {
    type: String,
  },
  
  newvalue: {
    type: String,
  }, */

  opportunityid: {
    type: String,
  }, 

  opportunity: {
    type: Schema.Types.ObjectId,
    ref: "opportunity",
  }, 
  
});
const noteModel = mongoose.model("note", noteSchema);

module.exports = noteModel;