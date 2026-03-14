const mongoose = require("mongoose");
const validator = require('validator');

const reviewerUserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, 'Please provide a valid email']
    },
    phone: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const ReviewerUser = mongoose.model('ReviewerUser', reviewerUserSchema);
module.exports = ReviewerUser;