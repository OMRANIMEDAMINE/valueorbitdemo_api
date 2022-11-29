const mongoose = require("mongoose");

const {
  Schema
} = mongoose;
const managerJudgementSchema = new Schema({

  
  name: {
    type: String,
  },
  
  percentage_forecast: {
    type: Number,
  },
 
  percentage_best_case: {
    type: Number,
  }

/*   histories: [{
    type: Schema.Types.ObjectId,
    ref: "forecasthealthcheckhistory",
  }, ], */

});


const managerJudgementModel = mongoose.model("managerjudgement", managerJudgementSchema);
module.exports = managerJudgementModel;