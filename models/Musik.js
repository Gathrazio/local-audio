const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const bcrypt = require('bcrypt');

const saltRounds = 10;

const musikSchema = new Schema({
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
    givenName: {
        type: String,
        required: false
    },
    description: {
        type: String,
        required: false
    },
    plays: {
        type: Number,
        required: false
    },
    length: {
        type: Number,
        required: false
    },
    size: {
        type: Number,
        required: true
    }
}, { timestamps: true })

module.exports = mongoose.model("Musik", musikSchema);