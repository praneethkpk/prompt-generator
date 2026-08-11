// src/services/llmService.js
// ──────────────────────────────────────────────────────────────
// DUAL-MODE LLM SERVICE (SERVER PROXY + CLIENT BYOK)
// ──────────────────────────────────────────────────────────────
// 1. If user enters an API key in UI Settings (stored in localStorage),
//    requests are sent directly to the LLM provider API from the browser.
// 2. Otherwise, requests are routed to the secure /api/* backend proxy.
// ──────────────────────────────────────────────────────────────

const API_BASE = "/api";

/**
 * Get user settings stored in localStorage (if any).
 */
export function getStoredSettings() {
  try {
    const raw = localStorage.getItem("prompt_gen_settings");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save user settings to localStorage.
 */
export function saveSettings(settings) {
  if (!settings || !settings.apiKey?.trim()) {
    localStorage.removeItem("prompt_gen_settings");
  } else {
    localStorage.setItem("prompt_gen_settings", JSON.stringify(settings));
  }
}

/**
 * Call LLM directly from client if custom settings exist, otherwise call backend proxy.
 */
async function sendLLMRequest(prompt, systemMessage = null) {
  const custom = getStoredSettings();

  // ── Mode 1: Client BYOK (Bring Your Own Key) ──
  if (custom && custom.apiKey?.trim()) {
    const apiKey = custom.apiKey.trim();
    let baseURL = custom.baseURL?.trim() || "https://api.openai.com/v1";
    const model = custom.model?.trim() || "gpt-4o-mini";

    // Standardize baseURL to end with /
    if (!baseURL.endsWith("/")) baseURL += "/";
    const endpoint = `${baseURL}chat/completions`;

    const messages = [];
    if (systemMessage) {
      messages.push({ role: "system", content: systemMessage });
    }
    messages.push({ role: "user", content: prompt });

    let res;
    try {
      res = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model,
          messages,
          temperature: 0.7,
          max_tokens: 2048,
        }),
      });
    } catch (err) {
      throw new Error(
        `Network error calling ${baseURL} — check your internet connection or URL.`
      );
    }

    const data = await res.json();
    if (!res.ok) {
      const msg = data.error?.message || data.error || `HTTP Error ${res.status}`;
      throw new Error(`LLM Error: ${msg}`);
    }

    const resultText = data.choices?.[0]?.message?.content;
    if (!resultText) throw new Error("LLM returned an empty response.");
    return resultText;
  }

  // ── Mode 2: Server Proxy ──
  let res;
  try {
    res = await fetch(`${API_BASE}${systemMessage ? "/generate" : "/test"}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt, systemMessage }),
    });
  } catch (err) {
    throw new Error(
      "Cannot reach the server proxy. Please enter an API key in ⚙️ Settings or make sure the server is running."
    );
  }

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Server error (${res.status})`);
  }

  return data.result;
}

/**
 * Generate an engineered prompt from the given meta-prompt string.
 */
export async function generatePrompt(metaPrompt) {
  const defaultSystemMsg =
    "You are a world-class prompt engineer. Follow the user's meta-prompt instructions precisely.";
  return sendLLMRequest(metaPrompt, defaultSystemMsg);
}

/**
 * "Test" a generated prompt by sending it to the LLM and returning a sample response.
 */
export async function testPrompt(prompt) {
  return sendLLMRequest(prompt);
}
