const express = require('express');
const router = express.Router({mergeParams: true});
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../schemas");
const ExpressError = require("../utils/ExpressError");
let Campground;
Campground = require('../models/campground');
let Review;
Review = require('../models/review');

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    }
    next();
}

router.post('/', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/:reviewId', catchAsync( async (req, res) => {
    const campgroundId = req.params.id;
    const reviewId = req.params.reviewId;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(campgroundId, {$pull: { reviews: reviewId }})
    req.flash('success', 'Successfully deleted review!');
    res.redirect(`/campgrounds/${campgroundId}`);
}));

module.exports = router;
