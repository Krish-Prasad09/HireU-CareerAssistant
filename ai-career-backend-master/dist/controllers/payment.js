import Razorpay from "razorpay";
import crypto from "crypto";
import TryCatch from "../middlewares/trycatch.js";
import User from "../models/User.js";
export const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});
// Rs.1 = 100 paise per pack of 10 credits
const CREDIT_PACK_PRICE_PAISE = 100; // ₹1
const CREDITS_PER_PACK = 10;
// POST /api/payment/checkout
// Creates a Razorpay order for 1 credit pack
export const createOrder = TryCatch(async (req, res) => {
    const order = await instance.orders.create({
        amount: CREDIT_PACK_PRICE_PAISE,
        currency: "INR",
        receipt: `receipt_${Date.now()}`,
        notes: {
            userId: req.user?._id?.toString() ?? "",
            credits: CREDITS_PER_PACK.toString(),
        },
    });
    res.json({ order, key: process.env.RAZORPAY_KEY_ID });
});
// POST /api/payment/verify
// Verifies Razorpay signature and credits the user
export const verifyPayment = TryCatch(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");
    if (expectedSignature !== razorpay_signature) {
        return res.status(400).json({ message: "Payment verification failed" });
    }
    const user = await User.findById(req.user?._id);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    user.paidCredits += CREDITS_PER_PACK;
    await user.save();
    res.json({
        message: `Payment successful! ${CREDITS_PER_PACK} credits added.`,
        updatedUser: user,
    });
});
// GET /api/payment/status  – returns user's current credit info
export const creditStatus = TryCatch(async (req, res) => {
    const user = await User.findById(req.user?._id);
    if (!user)
        return res.status(404).json({ message: "User not found" });
    res.json({
        freeRequestsUsed: user.freeRequestsUsed,
        freeRequestsLeft: user.getRemainingFreeRequests(),
        paidCredits: user.paidCredits,
        canMakeRequest: user.canMakeRequest(),
    });
});
