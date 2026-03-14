const mongoose = require("mongoose");
const crypto = require('crypto');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const { stringify } = require('json5');
const reviewSchema = new mongoose.Schema({
    timestamp: {
        type: Date,
        default: Date.now,
        required: true
    },

    user_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'ReviewerUser',
        required: true
    },
    company_id: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'a review must belong to a user, i.e. company']
    },
    feedback: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    city: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    locality: {
        type: String,
        required: [true, 'Review cannot be empty']
    },
    type: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        default: Date.now()
    },
    price_rating: {
        type: Number,
        min: 1,
        max: 5
    },
    service_rating: {
        type: Number,
        min: 1,
        max: 5
    },
    speed_rating: {
        type: Number,
        min: 1,
        max: 5
    },
    overall_rating: {
        type: Number,
        min: 1,
        max: 5
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});
reviewSchema.pre(/^find/, function(next) {

    this.populate({
            path: 'user',
            select: 'name'
        })

    next();
})
const review = mongoose.model('Review', reviewSchema);
module.exports = review;