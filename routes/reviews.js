const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
let Campground;
Campground = require('../models/campground');
let Review;
Review = require('../models/review');
const { isLoggedIn, validateReview, isReviewAuthor } = require('../middleware');
router.post('/', isLoggedIn, validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync( async (req, res) => {
    const campgroundId = req.params.id;
    const reviewId = req.params.reviewId;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(campgroundId, {$pull: { reviews: reviewId }})
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}));

module.exports = router;
