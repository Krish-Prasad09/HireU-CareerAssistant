import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { submitReview, getReviews } from "../controllers/review.js";
const router = express.Router();
router.post("/", isAuth, submitReview);
router.get("/", getReviews);
export default router;
