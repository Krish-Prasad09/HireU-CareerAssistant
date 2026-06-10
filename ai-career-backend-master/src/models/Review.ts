import mongoose, { Document, Schema } from "mongoose";

export interface IReview extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userImage: string;
  rating: number;       // 1–5
  comment: string;
  createdAt: Date;
}

const schema: Schema<IReview> = new Schema(
  {
    userId:    { type: Schema.Types.ObjectId, ref: "User", required: true },
    userName:  { type: String, required: true },
    userImage: { type: String, required: true },
    rating:    { type: Number, required: true, min: 1, max: 5 },
    comment:   { type: String, required: true, maxlength: 500 },
  },
  { timestamps: true }
);

const Review = mongoose.model<IReview>("Review", schema);
export default Review;
