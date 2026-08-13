// src/services/adapters/index.js
/**
 * Unified Provider Adapter Engine
 * Supports BYOK direct browser requests for multiple LLM providers:
 * - Google Gemini (v1beta REST & OpenAI-compatible endpoint)
 * - OpenAI (v1 chat completions)
 * - Groq (Ultra-fast LLM API)
 * - OpenRouter (Multi-model router with custom headers)
 * - DeepSeek AI (DeepSeek v1 API)
 * - Mistral AI (Mistral completions)
 * - Ollama (Local desktop/server endpoint)
 * - Custom (User-defined OpenAI-compatible API with protocol validation)
 */

export const PROVIDER_PRESETS = {
  gemini: {
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai",
    models: ["gemini-3.6-flash", "gemini-3.5-flash-lite", "gemini-3.1-pro", "gemini-2.5-flash", "gemini-1.5-pro"],
    placeholderKey: "AQ.Ab8RN...",
    docsUrl: "https://aistudio.google.com/app/apikey",
    authHeaderType: "bearer",
  },
  openai: {
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo", "o3-mini"],
    placeholderKey: "sk-proj-...",
    docsUrl: "https://platform.openai.com/api-keys",
    authHeaderType: "bearer",
  },
  groq: {
    name: "Groq (Ultra-Fast)",
    baseURL: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768", "deepseek-r1-distill-llama-70b"],
    placeholderKey: "gsk_...",
    docsUrl: "https://console.groq.com/keys",
    authHeaderType: "bearer",
  },
  openrouter: {
    name: "OpenRouter",
    baseURL: "https://openrouter.ai/api/v1",
    models: ["google/gemini-2.5-flash", "meta-llama/llama-3.3-70b-instruct", "anthropic/claude-3.5-sonnet", "deepseek/deepseek-r1"],
    placeholderKey: "sk-or-v1-...",
    docsUrl: "https://openrouter.ai/keys",
    authHeaderType: "bearer",
    extraHeaders: {
      "HTTP-Referer": "https://prompt-generator.netlify.app",
      "X-Title": "BYOK Prompt Generator",
    },
  },
  deepseek: {
    name: "DeepSeek AI",
    baseURL: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
    placeholderKey: "sk-...",
    docsUrl: "https://platform.deepseek.com/api_keys",
    authHeaderType: "bearer",
  },
  mistral: {
    name: "Mistral AI",
    baseURL: "https://api.mistral.ai/v1",
    models: ["mistral-small-latest", "mistral-large-latest", "pixtral-12b-2409"],
    placeholderKey: "...",
    docsUrl: "https://console.mistral.ai/api-keys",
    authHeaderType: "bearer",
  },
  ollama: {
    name: "Local Ollama",
    baseURL: "http://localhost:11434/v1",
    models: ["llama3.2", "qwen2.5-coder", "mistral", "deepseek-r1"],
    placeholderKey: "Not required for local Ollama",
    docsUrl: "https://ollama.com",
    authHeaderType: "none",
  },
  custom: {
    name: "Custom OpenAI-Compatible Provider",
    baseURL: "",
    models: [],
    placeholderKey: "your-api-key",
    docsUrl: "",
    authHeaderType: "bearer",
    isCustom: true,
  },
};

/**
 * Custom URL protocol validator
 * Rejects dangerous URI schemes (javascript:, data:, file:, ftp:)
 * Enforces HTTPS for remote hosts (allows http for localhost / 127.0.0.1)
 */
export function validateCustomBaseURL(urlStr) {
  if (!urlStr || !urlStr.trim()) return { valid: false, reason: "Base URL cannot be empty." };
  const trimmed = urlStr.trim();

  let parsed;
  try {
    parsed = new URL(trimmed);
  } catch {
    return { valid: false, reason: "Invalid URL syntax. Please include protocol (e.g. https://)." };
  }

  const allowedProtocols = ["https:", "http:"];
  if (!allowedProtocols.includes(parsed.protocol)) {
    return { valid: false, reason: `Protocol '${parsed.protocol}' is not allowed.` };
  }

  // If HTTP, allow only local development endpoints
  if (parsed.protocol === "http:") {
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "localhost" && hostname !== "127.0.0.1" && hostname !== "0.0.0.0") {
      return { valid: false, reason: "Insecure HTTP allowed only for localhost endpoints. Remote endpoints must use HTTPS." };
    }
  }

  return { valid: true, sanitizedURL: trimmed };
}

/**
 * Standardized endpoint resolution
 */
function buildEndpoint(baseURL) {
  let url = baseURL.trim();
  if (!url.endsWith("/")) url += "/";
  if (!url.endsWith("chat/completions")) {
    url += "chat/completions";
  }
  return url;
}

/**
 * Build request headers according to provider specs
 */
function buildHeaders(providerKey, apiKey) {
  const preset = PROVIDER_PRESETS[providerKey] || PROVIDER_PRESETS.custom;
  const headers = {
    "Content-Type": "application/json",
  };

  if (preset.authHeaderType === "bearer" && apiKey && apiKey.trim()) {
    headers["Authorization"] = `Bearer ${apiKey.trim()}`;
  }

  if (preset.extraHeaders) {
    Object.assign(headers, preset.extraHeaders);
  }

  return headers;
}

/**
 * Send request via Provider Adapter with 30s AbortController timeout & error sanitization
 */
export async function sendAdapterRequest({
  providerKey,
  apiKey,
  baseURL,
  model,
  messages,
  temperature = 0.7,
  maxTokens = 2048,
}) {
  const preset = PROVIDER_PRESETS[providerKey] || PROVIDER_PRESETS.custom;
  const effectiveBaseURL = baseURL?.trim() || preset.baseURL;

  if (!effectiveBaseURL) {
    throw new Error("Base URL is missing. Please configure Base URL in Settings.");
  }

  // Validate custom URL protocol safety
  const urlValidation = validateCustomBaseURL(effectiveBaseURL);
  if (!urlValidation.valid) {
    throw new Error(`Invalid Base URL: ${urlValidation.reason}`);
  }

  const endpoint = buildEndpoint(effectiveBaseURL);
  const headers = buildHeaders(providerKey, apiKey);

  const payload = {
    model: model || preset.models[0] || "gpt-4o-mini",
    messages,
    temperature,
    max_tokens: maxTokens,
  };

  const startTime = performance.now();

  // 30-Second AbortController Timeout Guard
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000);

  let res;
  try {
    res = await fetch(endpoint, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Request timed out after 30 seconds. Provider endpoint did not respond.");
    }
    throw new Error(
      `Network error connecting to ${effectiveBaseURL}. Check internet connection or CORS/CSP settings.`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  const latencyMs = Math.round(performance.now() - startTime);
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    let rawError = data?.error?.message || data?.error || data?.message || `HTTP ${res.status}`;
    if (typeof rawError !== "string") rawError = JSON.stringify(rawError);
    // Cap error message length at 500 characters
    const sanitizedError = rawError.length > 500 ? `${rawError.slice(0, 500)}...` : rawError;
    throw new Error(`Provider Error (${res.status}): ${sanitizedError}`);
  }

  const resultText = data?.choices?.[0]?.message?.content;
  if (!resultText) {
    throw new Error("Provider returned an empty response.");
  }

  return {
    content: resultText,
    latencyMs,
    usage: data?.usage || null,
  };
}

/**
 * Test Connection helper measuring latency and response
 */
export async function testAdapterConnection({ providerKey, apiKey, baseURL, model }) {
  const preset = PROVIDER_PRESETS[providerKey] || PROVIDER_PRESETS.custom;
  const effectiveModel = model || preset.models[0] || "gemini-3.6-flash";

  const testMessages = [
    { role: "user", content: "Reply with the single word 'OK' if you receive this test." }
  ];

  try {
    const result = await sendAdapterRequest({
      providerKey,
      apiKey,
      baseURL,
      model: effectiveModel,
      messages: testMessages,
      maxTokens: 10,
    });

    return {
      success: true,
      providerName: preset.name || providerKey,
      latencyMs: result.latencyMs,
      model: effectiveModel,
      message: `Connection successful (${result.latencyMs}ms)`,
    };
  } catch (err) {
    return {
      success: false,
      error: err.message,
    };
  }
}
