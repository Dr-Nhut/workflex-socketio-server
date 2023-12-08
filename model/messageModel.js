const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
    sender: {
        type: String,
        required: true
    },
    users: {
        type: Array,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    }
},
    {
        timestamps: true,
    }
);
module.exports = mongoose.model("Message", messageSchema)