import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import TryCatch from "../middlewares/trycatch.js";
import User from "../models/User.js";
import { buildResumePrompt, generateInterviewPrompt, JobMatcherPrompt, ResumeAnalyserPrompt, } from "../config/prompt.js";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });
/**
 * Deducts one request from the user:
 *   - If still in free tier  → increment freeRequestsUsed
 *   - If on paid credits     → decrement paidCredits
 *   - Pro users are not counted (unlimited)
 */
async function recordUsage(user, type, summary) {
    if (!user)
        return;
    if (!user.hasProAccess()) {
        if (user.freeRequestsUsed < 10) {
            user.freeRequestsUsed += 1;
        }
        else if (user.paidCredits > 0) {
            user.paidCredits -= 1;
        }
    }
    // Always push to history (capped at 100 entries to keep doc small)
    user.history.unshift({ type, summary, createdAt: new Date() });
    if (user.history.length > 100)
        user.history = user.history.slice(0, 100);
    await user.save();
}
// ─── Analyse Resume ────────────────────────────────────────────────────────────
export const analyseResume = TryCatch(async (req, res) => {
    const { pdfBase64 } = req.body;
    if (!pdfBase64)
        return res.status(400).json({ message: "PDF data is required" });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "You have used all 10 free requests. Purchase a credit pack to continue.",
            showPayment: true,
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
            {
                role: "user",
                parts: [
                    { text: ResumeAnalyserPrompt },
                    {
                        inlineData: {
                            mimeType: "application/pdf",
                            data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
                        },
                    },
                ],
            },
        ],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText)
        return res.status(500).json({ message: "AI returned empty response" });
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch {
        return res
            .status(500)
            .json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }
    await recordUsage(user, "resume_analyse", `ATS Score: ${jsonResponse.atsScore ?? "—"}`);
    res.json(jsonResponse);
});
// ─── Job Matcher ───────────────────────────────────────────────────────────────
export const jobMatcher = TryCatch(async (req, res) => {
    const { mode, skills, experience, pdfBase64 } = req.body;
    if (!mode)
        return res.status(400).json({ message: "Mode is required" });
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
        return res.status(400).json({ message: "Skills and experience are required" });
    if (mode === "resume" && !pdfBase64)
        return res.status(400).json({ message: "PDF is required" });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "You have used all 10 free requests. Purchase a credit pack to continue.",
            showPayment: true,
        });
    }
    const parts = [{ text: JobMatcherPrompt(mode, skills, experience) }];
    if (mode === "resume") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            },
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText)
        return res.status(500).json({ message: "AI returned empty response" });
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch {
        return res
            .status(500)
            .json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }
    const jobCount = jsonResponse.jobs?.length ?? 0;
    await recordUsage(user, "job_match", `${jobCount} jobs matched`);
    res.json(jsonResponse);
});
// ─── Generate Interview ────────────────────────────────────────────────────────
export const generateInterview = TryCatch(async (req, res) => {
    const { mode, round, skills, experience, pdfBase64 } = req.body;
    if (!mode || !round)
        return res.status(400).json({ message: "Mode and round are required" });
    if (mode === "manual" && (!skills?.length || !experience?.trim()))
        return res.status(400).json({ message: "Skills and experience are required" });
    if (mode === "resume" && !pdfBase64)
        return res.status(400).json({ message: "PDF is required" });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "You have used all 10 free requests. Purchase a credit pack to continue.",
            showPayment: true,
        });
    }
    const parts = [
        { text: generateInterviewPrompt(round, mode, skills, experience) },
    ];
    if (mode === "resume") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            },
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText)
        return res.status(500).json({ message: "AI returned empty response" });
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch {
        return res
            .status(500)
            .json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }
    const roundLabel = round === "hr" ? "HR Round" : "Technical Round";
    await recordUsage(user, "interview_prep", `${jsonResponse.role ?? "Unknown role"} · ${roundLabel}`);
    res.json(jsonResponse);
});
// ─── Build Resume ──────────────────────────────────────────────────────────────
export const buildResume = TryCatch(async (req, res) => {
    const { mode, formData, pdfBase64 } = req.body;
    if (!mode)
        return res.status(400).json({ message: "Mode is required" });
    if (mode === "manual" && !formData)
        return res.status(400).json({ message: "Form data is required" });
    if (mode === "improve" && !pdfBase64)
        return res.status(400).json({ message: "PDF is required" });
    const user = await User.findById(req.user?._id);
    if (!user || !user.canMakeRequest()) {
        return res.status(403).json({
            message: "You have used all 10 free requests. Purchase a credit pack to continue.",
            showPayment: true,
        });
    }
    const parts = [{ text: buildResumePrompt(mode, formData) }];
    if (mode === "improve") {
        parts.push({
            inlineData: {
                mimeType: "application/pdf",
                data: pdfBase64.replace(/^data:application\/pdf;base64,/, ""),
            },
        });
    }
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [{ role: "user", parts }],
    });
    const rawText = response.text?.replace(/```json|```/g, "").trim();
    if (!rawText)
        return res.status(500).json({ message: "AI returned empty response" });
    let jsonResponse;
    try {
        jsonResponse = JSON.parse(rawText);
    }
    catch {
        return res
            .status(500)
            .json({ message: "AI returned invalid JSON", rawResponse: response.text });
    }
    const name = jsonResponse.name ?? formData?.name ?? "Resume";
    await recordUsage(user, "resume_build", `Built resume for ${name}`);
    res.json(jsonResponse);
});
