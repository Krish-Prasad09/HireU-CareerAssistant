// import express from "express";
import dotenv from "dotenv";
dotenv.config();
import express from "express";
import connectDB from "./config/db.js";
import userRoutes from "./routes/user.js";
import aiRoutes from "./routes/ai.js";
import reviewRoutes from "./routes/review.js";
import paymentRoutes from "./routes/payment.js";
import cors from "cors";
// import Razorpay from "razorpay";
// import axios from "axios";

// const url = `https://ai-career-backend-q7xn.onrender.com`;
// const interval = 30000;

// function reloadWebsite() {
//   axios
//     .get(url)
//     .then((response) => {
//       console.log("website reloded");
//     })
//     .catch((error) => {
//       console.error(`Error : ${error.message}`);
//     });
// }

// setInterval(reloadWebsite, interval);

// dotenv.config();

connectDB().then(() => console.log("DB connected"));

// export const instance = new Razorpay({
//   key_id: process.env.Razorpay_Key!,
//   key_secret: process.env.Razorpay_Secret!,
// });

const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = [
  "http://localhost:5173",
  "https://hire-u-career-assistant.vercel.app",
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.get("/", (_req, res) => {
  res.json({ status: "ok", service: "HireU Career Assistant API" });
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.use("/api/user", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/review", reviewRoutes);
app.use("/api/payment", paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
