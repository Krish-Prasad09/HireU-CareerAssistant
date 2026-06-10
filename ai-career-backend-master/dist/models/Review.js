import mongoose, { Schema } from "mongoose";
const schema = new Schema({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName: { type: String, required: true },
    userImage: { type: String, required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true, maxlength: 500 },
}, { timestamps: true });
const Review = mongoose.model("Review", schema);
export default Review;
