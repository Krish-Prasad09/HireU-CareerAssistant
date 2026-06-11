import express from "express";
import { loginUser, myProfile, myHistory } from "../controllers/user.js";
import { isAuth } from "../middlewares/isAuth.js";

const router = express.Router();

router.post("/login",   loginUser);
router.get("/me",       isAuth, myProfile);
router.get("/history",  isAuth, myHistory);

export default router;
