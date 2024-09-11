const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
    },

    mobile: {
        type: String,
    },

    email: {
        type: String,
        unique: true
    },

    address: {
        type: String,
        require: true
    },

    adharCardNumber: {
        type: Number,
        require: true,
        unique: true,
    },

    age: {
        type: Number,
        require: true,
    },

    password: {
        type: String,
        require: true
    },

    role: {
        type: String,
        enum: ['voter', 'admin'],
    },

    isVoted: {
        type: Boolean,
        default: false
    }
});


const User = mongoose.model('users', userSchema);

module.exports = User