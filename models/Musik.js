const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const saltRounds = 10;

const discoverySchema = new Schema({
    originalName: {
        type: String,
        required: true
    },
    gridId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    gridFileName: {
        type: String,
        required: true
    },
    batesNumbers: {
        type: [String],
        required: false
    },
    batesIndices: {
        type: [Number],
        required: false
    },
    batesPrefix: {
        type: String,
        required: false
    },
    text: {
        type: String,
        required: false
    },
    size: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Discovery", discoverySchema);