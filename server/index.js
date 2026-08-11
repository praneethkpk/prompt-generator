// server/index.js
// ──────────────────────────────────────────────────────────────
// Secure Backend Proxy for LLM API
// ──────────────────────────────────────────────────────────────
// This Express server acts as a thin proxy between the React frontend
// and the LLM provider. The API key lives ONLY on the server — it is
// never sent to the browser.
//
// Environment variables (loaded from .env at project root):
//   LLM_API_KEY   — Required. Your LLM provider API key.
//   LLM_BASE_URL  — Optional. Defaults to https://api.openai.com/v1
//   LLM_MODEL     — Optional. Defaults to gpt-4o-mini
//   PORT          — Optional. Defaults to 3001
// ──────────────────────────────────────────────────────────────

import express from "express";
import cors from "cors";
import OpenAI from "openai";
import { config } from "dotenv";

// Load .env from project root
config();

const app = express();

// ── Configuration ──
const PORT = process.env.PORT || 3001;
const LLM_API_KEY = process.env.LLM_API_KEY;
const LLM_BASE_URL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
const LLM_MODEL = process.env.LLM_MODEL || "gpt-4o-mini";

if (!LLM_API_KEY || LLM_API_KEY === "your-api-key-here") {
  console.error("❌ LLM_API_KEY is not set in .env — server cannot start.");
  process.exit(1);
}

// ── OpenAI Client (server-side only) ──
const openai = new OpenAI({
  apiKey: LLM_API_KEY,
  baseURL: LLM_BASE_URL,
});

// ── Middleware ──
app.use(express.json({ limit: "16kb" }));
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:4173"],
    methods: ["POST"],
  })
);

// ── Simple rate limiter (in-memory, per IP) ──
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 15; // max requests per window

function rateLimit(req, res, next) {
  const ip = req.ip || req.socket.remoteAddress;
  const now = Date.now();
  const entry = rateLimitMap.get(ip) || { count: 0, start: now };

  if (now - entry.start > RATE_LIMIT_WINDOW_MS) {
    entry.count = 1;
    entry.start = now;
  } else {
    entry.count++;
  }

  rateLimitMap.set(ip, entry);

  if (entry.count > RATE_LIMIT_MAX) {
    return res.status(429).json({ error: "Too many requests. Please wait a moment." });
  }
  next();
}

// ── Input validation ──
function validateBody(req, res, next) {
  const { prompt } = req.body;
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Missing or empty 'prompt' field." });
  }
  if (prompt.length > 10_000) {
    return res.status(400).json({ error: "Prompt too long (max 10,000 chars)." });
  }
  next();
}

// ── Routes ──

/**
 * POST /api/generate
 * Body: { prompt: string, systemMessage?: string }
 * Returns: { result: string }
 */
app.post("/api/generate", rateLimit, validateBody, async (req, res) => {
  const { prompt, systemMessage } = req.body;

  try {
    const messages = [];
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    } else {
      messages.push({
        role: "system",
        content:
          "You are a world-class prompt engineer. Follow the user's meta-prompt instructions precisely.",
      });
    }
    messages.push({ role: "user", content: prompt });

    const response = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) {
      return res.status(502).json({ error: "LLM returned an empty response." });
    }

    return res.json({ result: text });
  } catch (err) {
    console.error("[/api/generate] Error:", err.message);

    if (err.status === 401) {
      return res.status(502).json({ error: "Server LLM key is invalid." });
    }
    if (err.status === 429) {
      return res.status(429).json({ error: "LLM rate limit exceeded. Try again shortly." });
    }
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * POST /api/test
 * Body: { prompt: string }
 * Returns: { result: string }
 */
app.post("/api/test", rateLimit, validateBody, async (req, res) => {
  const { prompt } = req.body;

  try {
    const response = await openai.chat.completions.create({
      model: LLM_MODEL,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) {
      return res.status(502).json({ error: "LLM returned an empty test response." });
    }

    return res.json({ result: text });
  } catch (err) {
    console.error("[/api/test] Error:", err.message);
    return res.status(500).json({ error: "Test failed due to a server error." });
  }
});

// ── Health check ──
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    model: LLM_MODEL,
    baseURL: LLM_BASE_URL,
  });
});

// ── Start ──
app.listen(PORT, () => {
  console.log(`\n🔒 Secure LLM Proxy running at http://localhost:${PORT}`);
  console.log(`   📡 Provider: ${LLM_BASE_URL}`);
  console.log(`   🤖 Model:    ${LLM_MODEL}`);
  console.log(`   🔑 API Key:  ${LLM_API_KEY.slice(0, 8)}…(hidden)\n`);
});
