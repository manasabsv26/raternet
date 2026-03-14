const reviewController = require('./../controllers/reviewController');
const authController = require('./../controllers/authController');
const express = require('express');
const router = express.Router();



router.route('/')
    .get(reviewController.getallReviews)
    .post(reviewController.createReview);

// Add update and delete review routes
router.route('/:id')
    .patch(reviewController.updateReview)
    .delete(reviewController.deleteReview);

router.route('/options/:id')
    .get(reviewController.getReviewsByCid);

router.route('/user/:id')
    .get(reviewController.getReviewsByUid);

router.route('/locality/:id')
    .get(reviewController.getReviewByCandL);
    

module.exports = router;