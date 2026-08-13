// src/services/llmService.js
// ──────────────────────────────────────────────────────────────
// SECURE BYOK LLM SERVICE (CLIENT-SIDE DIRECT FETCH)
// ──────────────────────────────────────────────────────────────
// Security Guarantees:
// 1. API Keys are kept in In-Memory Application State ONLY.
// 2. Secret keys are NEVER written to localStorage, cookies, or logs.
// 3. Requests travel directly from the browser to the selected LLM endpoint.
// ──────────────────────────────────────────────────────────────

import {
  PROVIDER_PRESETS,
  sendAdapterRequest,
  testAdapterConnection,
} from "./adapters";

// In-memory key holder for current browser session
let inMemoryApiKey = "";

/**
 * Set active session API key (In-Memory ONLY)
 */
export function setSessionApiKey(key) {
  inMemoryApiKey = typeof key === "string" ? key.trim() : "";
}

/**
 * Get active session API key (In-Memory ONLY)
 */
export function getSessionApiKey() {
  return inMemoryApiKey;
}

/**
 * Clear in-memory API key
 */
export function clearSessionApiKey() {
  inMemoryApiKey = "";
}

/**
 * Get non-sensitive user settings stored in localStorage.
 * Note: Never contains the raw API key.
 */
export function getStoredSettings() {
  try {
    const raw = localStorage.getItem("prompt_gen_settings_v2");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * Save non-sensitive settings (provider, model, baseURL) to localStorage.
 */
export function saveSettings(settings) {
  if (!settings) {
    localStorage.removeItem("prompt_gen_settings_v2");
    return;
  }

  // Explicitly strip apiKey from object before saving to localStorage
  const safeSettings = {
    provider: settings.provider || "gemini",
    model: settings.model || "gemini-3.6-flash",
    baseURL: settings.baseURL || "",
    customEndpointsApproved: settings.customEndpointsApproved || [],
  };

  localStorage.setItem("prompt_gen_settings_v2", JSON.stringify(safeSettings));
}

/**
 * Call LLM using active session configuration.
 */
export async function sendLLMRequest(prompt, systemMessage = null, customConfig = null) {
  const stored = getStoredSettings() || {};
  const provider = customConfig?.provider || stored.provider || "gemini";
  const model = customConfig?.model || stored.model || PROVIDER_PRESETS[provider]?.models[0] || "gemini-3.6-flash";
  const baseURL = customConfig?.baseURL || stored.baseURL || PROVIDER_PRESETS[provider]?.baseURL || "";
  const apiKey = customConfig?.apiKey ?? getSessionApiKey();

  if (!apiKey && provider !== "ollama") {
    throw new Error(
      "No API key provided. Please enter your API key in ⚙️ Settings."
    );
  }

  const messages = [];
  if (systemMessage) {
    messages.push({ role: "system", content: systemMessage });
  }
  messages.push({ role: "user", content: prompt });

  const response = await sendAdapterRequest({
    providerKey: provider,
    apiKey,
    baseURL,
    model,
    messages,
    temperature: 0.7,
    maxTokens: 2048,
  });

  return response.content;
}

/**
 * Generate an engineered prompt from the meta-prompt input.
 */
export async function generatePrompt(metaPrompt, customConfig = null) {
  const defaultSystemMsg =
    "You are a world-class prompt engineer. Follow the user's meta-prompt instructions precisely to generate a production-ready prompt.";
  return sendLLMRequest(metaPrompt, defaultSystemMsg, customConfig);
}

/**
 * Test a generated prompt against the active LLM.
 */
export async function testPrompt(prompt, customConfig = null) {
  return sendLLMRequest(prompt, null, customConfig);
}

/**
 * Test connection to configured provider
 */
export async function testConnection({ provider, apiKey, baseURL, model }) {
  const keyToUse = apiKey !== undefined ? apiKey : getSessionApiKey();
  return testAdapterConnection({
    providerKey: provider,
    apiKey: keyToUse,
    baseURL,
    model,
  });
}
