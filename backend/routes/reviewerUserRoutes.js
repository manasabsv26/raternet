const express = require('express');
const router = express.Router();
const reviewerUserController = require('../controllers/reviewerUserController');

router.post('/signup', reviewerUserController.signup);
router.post('/login', reviewerUserController.login);
router.get('/:id', reviewerUserController.getReviewerUserById);

module.exports = router;
