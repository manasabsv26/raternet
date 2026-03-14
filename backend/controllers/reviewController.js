
const Review = require('./../models/reviewmodel');
const AppError = require('./../utils/appError');
const catchAsync = require('./../utils/catchAsync');

// Update review by ID
exports.updateReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(200).json({
        status: 'success',
        data: {
            review
        }
    });
});
// Delete review by ID
exports.deleteReview = catchAsync(async (req, res, next) => {
    const review = await Review.findByIdAndDelete(req.params.id);
    if (!review) {
        return next(new AppError('No review found with that ID', 404));
    }
    res.status(204).json({
        status: 'success',
        data: null
    });
});

exports.getallReviews = catchAsync(async(req, res, next) => {

    const review = await Review.find();
    res.status(200).json({
        status: 'success',
        results: review.length,
        data: {
            review
        }
    })

});
exports.createReview = catchAsync(async(req, res, next) => {
    const { user_id, company_id, feedback, city, locality, type } = req.body;
    if (!user_id || !company_id || !feedback || !city || !locality || !type) {
        return next(new AppError('Missing required fields: user_id, company_id, feedback, city, locality, type', 400));
    }

    const newReview = await Review.create(req.body);
    res.status(201).json({
        status: 'success',

        data: {
            newReview
        }
    })

});

exports.getReviewsByUid = catchAsync(async(req, res, next) => {
    const review = await Review.find({ user_id: req.params.id });
    res.status(200).json({
        status: 'success',
        data: { review }
    });
});

exports.getReviewsByCid = catchAsync(async(req, res, next) => {
    const id = req.params.id
    const review = await Review.find({company_id : id})

    if (!review) {

        return next(new AppError('No plan found with that ID', 404));
    } else {

        res.status(200).json({
            status: 'success',
            data: {
                review
            }
        });
    }
});

exports.getReviewByCandL = catchAsync(async(req, res, next) => {

    const company_id = req.params.id
    const locality = req.params.locality

    const reviews = await Review.find({ 
        company_id: company_id, 
        locality: locality 
    });

    if (!reviews || reviews.length === 0) {
        return res.status(404).json({
            status: 'fail',
            message: 'No reviews found for this locality.'
        });
    }

    res.status(200).json({   // ✅ Changed to 200 OK
        status: 'success',
        data: reviews
    });

});