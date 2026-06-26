import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import TryCatch from "../middlewares/trycatch.js";
import User from "../models/User.js";
import { enhanceBulletPrompt, generateInterviewPrompt, JobMatcherPrompt, ResumeAnalyserPrompt, } from "../config/prompt.js";
import { generateLatexResume } from "../services/latexGenerator.js";
dotenv.config();
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY_GEMINI });
/**
 * Deducts one request from the user:
 *   - If still in free tier  → increment freeRequestsUsed
 *   - If on paid credits     → decrement paidCredits
 *   - Pro users are not counted (unlimited)
 */
async function recordUsage(user, type, summary, details) {
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
    user.history.unshift({ type, summary, details, createdAt: new Date() });
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
                    { text: `Current Date: ${new Date().toDateString()}\n\n${ResumeAnalyserPrompt}` },
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
    await recordUsage(user, "resume_analyse", `ATS Score: ${jsonResponse.atsScore ?? "N/A"}`, jsonResponse);
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
    const parts = [{ text: `Current Date: ${new Date().toDateString()}\n\n${JobMatcherPrompt(mode, skills, experience)}` }];
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
    await recordUsage(user, "job_match", `${jobCount} jobs matched`, jsonResponse);
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
        { text: `Current Date: ${new Date().toDateString()}\n\n${generateInterviewPrompt(round, mode, skills, experience)}` },
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
    await recordUsage(user, "interview_prep", `${jsonResponse.role ?? "Unknown role"} - ${roundLabel}`, jsonResponse);
    res.json(jsonResponse);
});
// ─── Build Resume ──────────────────────────────────────────────────────────────
export const buildResume = TryCatch(async (req, res) => {
    const { resumeData, formData } = req.body;
    const resume = resumeData ?? formData;
    if (!resume)
        return res.status(400).json({ message: "Resume data is required" });
    if (!resume.personal?.name?.trim())
        return res.status(400).json({ message: "Full name is required" });
    if (!resume.personal?.roll?.trim())
        return res.status(400).json({ message: "Roll number is required" });
    const user = await User.findById(req.user?._id);
    if (!user) {
        return res.status(401).json({ message: "Please Login" });
    }
    const latex = generateLatexResume(resume);
    const safeName = resume.personal.name.trim().replace(/[^\w-]+/g, "_");
    const fileName = `${safeName || "IIT_Indore"}_Resume.tex`;
    res.json({ resume, latex, fileName });
});
// ─── Enhance Bullet Point ──────────────────────────────────────────────────────
export const enhanceBullet = TryCatch(async (req, res) => {
    const { text } = req.body;
    if (!text?.trim())
        return res.status(400).json({ message: "Bullet point text is required" });
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
                parts: [{ text: enhanceBulletPrompt(text) }],
            },
        ],
    });
    const enhanced = response.text?.trim();
    if (!enhanced)
        return res.status(500).json({ message: "AI returned empty response" });
    await recordUsage(user, "resume_analyse", `Enhanced bullet point`, { originalText: text, enhancedText: enhanced });
    res.json({ enhanced });
});
