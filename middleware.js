const { campgroundSchema, reviewSchema } = require('./schemas.js');
const expressError = require('./utils/expressError');
const Campground = require('./models/campground');
const Review = require('./models/review');


module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first');
        return res.redirect('/login');
    }
    next();
}
//layout for this fn found on Joi docs
//middleware fn so uses (req,res,next)
module.exports.validateCampground = (req, res, next) => {
    //brings in the campgroundSchema from schemas folder
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        //if there is an error, prints out msg and status code
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        //crucial part of code must have next() to actually add the campground
        next();
    }
}
module.exports.isAuthor = async(req,res, next) => {
    const {id} = req.params;
    const campground = await Campground.findById(id);
    if(!campground.author.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
module.exports.isReviewAuthor = async(req,res, next) => {
    const {id, reviewId} = req.params;
    const review = await Review.findById(reviewId);
    if(!review.author.equals(req.user._id)){
        req.flash('error', 'you do not have permission to do that');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
}
//can just copy/paste for reviewSchema as well
module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        //if there is an error, prints out msg and status code
        const msg = error.details.map(el => el.message).join(',')
        throw new expressError(msg, 400)
    } else {
        //crucial part of code must have next() to actually add the review
        next();
    }
}