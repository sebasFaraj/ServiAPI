const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
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
    phone: {
      type: String,
      required: true,
      match: /^\+504\s\d{4}-\d{4}$/ // +504 ####-####
    }

    //Rating
},
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);