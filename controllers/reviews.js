const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    //pushes to the nested array in the specific campground
    campground.reviews.push(review);
    //use await since its a save fn
    await review.save();
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
}
module.exports.deleteReview = async (req, res) => {
    //gets the campground and review id
    const { id, reviewId } = req.params;
    //deletes the review id from the reviews array in the campground object
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    //deletes the review object
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}