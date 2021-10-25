const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
let Campground;
Campground = require('./models/campground');
let Review;
Review = require('./models/review');

const campgrounds = require('./routes/campgrounds');

mongoose.connect('mongodb://localhost:27017/yelp-camp').then(() => console.log('Mongo connection')).catch((error) => console.log(error));
const methodOverride = require('method-override');
const ejsMate = require('ejs-mate');
const catchAsync = require('./utils/catchAsync');
const ExpressError = require('./utils/ExpressError');
const { reviewSchema } = require('./schemas');

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    console.log('Database connected');
});

const app = express();

app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const message = error.details.map(el => el.message).join(',');
        throw new ExpressError(message, 400);
    }
    next();
}

app.use('/campgrounds', campgrounds);

app.get('/', (req, res) => {
    res.render('home');
});

app.post('/campgrounds/:id/reviews', validateReview, catchAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}));

app.delete('/campgrounds/:id/reviews/:reviewId', catchAsync( async (req, res) => {
    const campgroundId = req.params.id;
    const reviewId = req.params.reviewId;
    await Review.findByIdAndDelete(reviewId);
    await Campground.findByIdAndUpdate(campgroundId, {$pull: { reviews: reviewId }})
    res.redirect(`/campgrounds/${campgroundId}`);
}))

app.all('*', (req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

app.use((err, req, res, next) => {
    const {statusCode = 500} = err;
    if (!err.message) {
        err.message = 'Something went wrong!';
    }
    res.status(statusCode).render('error', {err});
});

const port = 3000;
app.listen(port, () => {
    console.log(`Serving on port ${port}`);
});
