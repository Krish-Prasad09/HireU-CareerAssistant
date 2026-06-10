import TryCatch from "../middlewares/trycatch.js";
import Review from "../models/Review.js";
// POST /api/review  – submit a review (auth required)
export const submitReview = TryCatch(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment?.trim())
        return res.status(400).json({ message: "Rating and comment are required" });
    if (rating < 1 || rating > 5)
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    if (!req.user?._id)
        return res.status(401).json({ message: "Please Login" });
    const user = req.user;
    const userId = user._id;
    // One review per user; update their existing review or create it.
    let review = await Review.findOne({ userId });
    if (review) {
        review.userName = user.name || review.userName;
        review.userImage = user.image || review.userImage;
        review.rating = rating;
        review.comment = comment.trim();
        await review.save();
    }
    else {
        review = await Review.create({
            userId,
            userName: user.name,
            userImage: user.image,
            rating,
            comment: comment.trim(),
        });
    }
    res.json({ message: "Review submitted!", review });
});
// GET /api/review  – public, returns latest 20 reviews
export const getReviews = TryCatch(async (_req, res) => {
    const reviews = await Review.find()
        .sort({ createdAt: -1 })
        .limit(20)
        .select("userName userImage rating comment createdAt");
    res.json(reviews);
});
