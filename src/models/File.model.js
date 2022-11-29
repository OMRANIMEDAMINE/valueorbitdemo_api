const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const fileSchema = new Schema({

    filename: {
        type: String,
    },

    description: {
        type: String,
    },

    isImage: {
        type: Boolean,
        default: false,

    },


    isPDF: {
        type: Boolean,
        default: false,
    },


    createddate: {
        type: Date,
        default: Date.now(),
    },


})
module.exports = mongoose.model('file', fileSchema)