// api/test.js (Vercel Serverless Function)
import OpenAI from "openai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
    return res.status(400).json({ error: "Missing or empty 'prompt' field." });
  }

  const apiKey = process.env.LLM_API_KEY;
  const baseURL = process.env.LLM_BASE_URL || "https://api.openai.com/v1";
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey || apiKey === "your-api-key-here") {
    return res.status(400).json({
      error: "No server LLM_API_KEY configured. Please enter your API key in ⚙️ Settings.",
    });
  }

  try {
    const openai = new OpenAI({ apiKey, baseURL });
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2048,
    });

    const text = response.choices?.[0]?.message?.content;
    if (!text) return res.status(502).json({ error: "LLM returned an empty test response." });

    return res.status(200).json({ result: text });
  } catch (err) {
    console.error("Serverless test error:", err.message);
    return res.status(500).json({ error: err.message || "Test failed due to a server error." });
  }
}
