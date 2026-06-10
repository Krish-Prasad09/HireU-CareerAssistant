import TryCatch from "../middlewares/trycatch.js";
import Review from "../models/Review.js";
// POST /api/review  – submit a review (auth required)
export const submitReview = TryCatch(async (req, res) => {
    const { rating, comment } = req.body;
    if (!rating || !comment?.trim())
        return res.status(400).json({ message: "Rating and comment are required" });
    if (rating < 1 || rating > 5)
        return res.status(400).json({ message: "Rating must be between 1 and 5" });
    // One review per user — upsert so they can update it later
    const review = await Review.findOneAndUpdate({ userId: req.user?._id }, {
        userId: req.user?._id,
        userName: req.user?.name,
        userImage: req.user?.image,
        rating,
        comment: comment.trim(),
    }, { upsert: true, new: true });
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
