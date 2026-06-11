import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { createOrder, verifyPayment, creditStatus } from "../controllers/payment.js";
const router = express.Router();
router.post("/checkout", isAuth, createOrder);
router.post("/verify", isAuth, verifyPayment);
router.get("/status", isAuth, creditStatus);
export default router;
