const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    completed: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    cancelled: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    noShow: {
        type: Number,
        required: false,
        default: 0,
        min: 0,
    },
    password: { type: String, required: true, selected: false },
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);