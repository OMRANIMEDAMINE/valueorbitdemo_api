const mongoose = require("mongoose");

const {
  Schema
} = mongoose;

const ai_predictions_Schema = new Schema({

  ai_best_case: {
    type: Number,
  },

  ai_commit: {
    type: Number,
  },

  type: {
    type: String,
  },


  fiscalyear: {
    type: Number,
  },

  fiscalquarter: {
    type: Number,
  },

  fiscalmonth: {
    type: Number,
  },

  createddate: {
    type: Date,
  },

  ai_prediction_manager_ai_best_case: [{
    type: Schema.Types.ObjectId,
    ref: "ai_prediction_manager_ai_best_case",
  }],

  ai_prediction_manager_ai_commit: [{
    type: Schema.Types.ObjectId,
    ref: "ai_prediction_manager_ai_commit",
  }],

  ai_prediction_sales_ai_best_case: [{
    type: Schema.Types.ObjectId,
    ref: "ai_prediction_sales_ai_best_case",
  }],

  ai_prediction_sales_ai_commit: [{
    type: Schema.Types.ObjectId,
    ref: "ai_prediction_sales_ai_commit",
  }],


  /*   ai_opportunity_predictions: [{
      type: Schema.Types.ObjectId,
      ref: "ai_opportunity_prediction",
    }]

   */
  /* 
    ai_win_rate: {
      type: Number,
    },

    accuracy: {
      type: Number,
    },

    next_best_actions_ids: [{
      type: Schema.Types.ObjectId,
      ref: "next_best_action",
      required: true,
    }, ], */


});
const ai_predictionModel = mongoose.model("ai_prediction", ai_predictions_Schema);
module.exports = ai_predictionModel;