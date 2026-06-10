import mongoose, { Schema } from "mongoose";
const HistoryEntrySchema = new Schema({
    type: {
        type: String,
        enum: ["resume_analyse", "job_match", "resume_build", "interview_prep"],
        required: true,
    },
    summary: { type: String, required: true },
}, { timestamps: true });
const schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    image: { type: String, required: true },
    subscription: { type: Date, default: null },
    freeRequestsUsed: { type: Number, default: 0 },
    paidCredits: { type: Number, default: 0 },
    history: { type: [HistoryEntrySchema], default: [] },
}, { timestamps: true });
// Pro = has a valid subscription date in the future
schema.methods.hasProAccess = function () {
    return !!this.subscription && new Date() < new Date(this.subscription);
};
// Can make a request if:
//   - Has active pro subscription, OR
//   - Still has free requests left (< 10), OR
//   - Has paid credits remaining
schema.methods.canMakeRequest = function () {
    if (this.hasProAccess())
        return true;
    if (this.freeRequestsUsed < 10)
        return true;
    if (this.paidCredits > 0)
        return true;
    return false;
};
schema.methods.getRemainingFreeRequests = function () {
    return Math.max(0, 10 - this.freeRequestsUsed);
};
const User = mongoose.model("User", schema);
export default User;
