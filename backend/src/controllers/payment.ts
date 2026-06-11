import Razorpay from "razorpay";
import crypto from "crypto";
import TryCatch from "../middlewares/trycatch.js";
import { AuthenticatedRequest } from "../middlewares/isAuth.js";
import User from "../models/User.js";

export const instance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

const PLANS = {
  credits_40: {
    amount: 2900,
    description: "40 AI Credits",
    credits: 40,
  },
  pro_monthly: {
    amount: 29900,
    description: "Monthly Unlimited Plan",
    months: 1,
  },
} as const;

type PaidPlanId = keyof typeof PLANS;

function addMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + months);
  return next;
}

export const createOrder = TryCatch(async (req: AuthenticatedRequest, res) => {
  const { planId } = req.body as { planId?: PaidPlanId };
  if (!planId || !(planId in PLANS)) {
    return res.status(400).json({ message: "Invalid payment plan" });
  }

  const plan = PLANS[planId];
  const order = await instance.orders.create({
    amount: plan.amount,
    currency: "INR",
    receipt: `${planId}_${Date.now()}`,
    notes: {
      userId: req.user?._id?.toString() ?? "",
      planId,
      description: plan.description,
    },
  });

  res.json({ order, key: process.env.RAZORPAY_KEY_ID });
});

export const verifyPayment = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: "Payment verification failed" });
    }

    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const order = await instance.orders.fetch(razorpay_order_id);
    const planId = order.notes?.planId as PaidPlanId | undefined;
    if (!planId || !(planId in PLANS)) {
      return res.status(400).json({ message: "Unknown payment plan" });
    }

    const plan = PLANS[planId];
    let message = "Payment successful!";

    if ("credits" in plan) {
      user.paidCredits += plan.credits;
      message = `Payment successful! ${plan.credits} credits added.`;
    } else {
      const startsFrom =
        user.subscription && new Date(user.subscription) > new Date()
          ? new Date(user.subscription)
          : new Date();
      user.subscription = addMonths(startsFrom, plan.months);
      message = "Payment successful! Unlimited plan activated for 1 month.";
    }

    await user.save();

    res.json({ message, updatedUser: user });
  }
);

export const creditStatus = TryCatch(
  async (req: AuthenticatedRequest, res) => {
    const user = await User.findById(req.user?._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({
      freeRequestsUsed: user.freeRequestsUsed,
      freeRequestsLeft: user.getRemainingFreeRequests(),
      paidCredits: user.paidCredits,
      subscription: user.subscription,
      hasProAccess: user.hasProAccess(),
      canMakeRequest: user.canMakeRequest(),
    });
  }
);
