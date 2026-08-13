import { describe, it, expect } from "vitest";
import { validateCustomBaseURL, PROVIDER_PRESETS } from "../index.js";

describe("Provider Adapters Engine", () => {
  describe("validateCustomBaseURL", () => {
    it("should accept valid HTTPS URLs", () => {
      const res = validateCustomBaseURL("https://api.custom-ai.com/v1");
      expect(res.valid).toBe(true);
      expect(res.sanitizedURL).toBe("https://api.custom-ai.com/v1");
    });

    it("should accept http://localhost and http://127.0.0.1 for local Ollama", () => {
      const res1 = validateCustomBaseURL("http://localhost:11434/v1");
      expect(res1.valid).toBe(true);

      const res2 = validateCustomBaseURL("http://127.0.0.1:11434/v1");
      expect(res2.valid).toBe(true);
    });

    it("should reject unencrypted http:// for non-local hosts", () => {
      const res = validateCustomBaseURL("http://api.untrusted.com/v1");
      expect(res.valid).toBe(false);
      expect(res.reason).toContain("Insecure HTTP allowed only for localhost");
    });

    it("should reject dangerous URI schemes (javascript:, file:, ftp:)", () => {
      const resJs = validateCustomBaseURL("javascript:alert(1)");
      expect(resJs.valid).toBe(false);

      const resFile = validateCustomBaseURL("file:///C:/secrets.txt");
      expect(resFile.valid).toBe(false);
    });

    it("should reject empty or malformed strings", () => {
      expect(validateCustomBaseURL("").valid).toBe(false);
      expect(validateCustomBaseURL("   ").valid).toBe(false);
      expect(validateCustomBaseURL("not-a-url").valid).toBe(false);
    });
  });

  describe("PROVIDER_PRESETS", () => {
    it("should contain official presets for Gemini, OpenAI, Groq, OpenRouter, DeepSeek, Mistral, Ollama", () => {
      expect(PROVIDER_PRESETS).toHaveProperty("gemini");
      expect(PROVIDER_PRESETS).toHaveProperty("openai");
      expect(PROVIDER_PRESETS).toHaveProperty("groq");
      expect(PROVIDER_PRESETS).toHaveProperty("openrouter");
      expect(PROVIDER_PRESETS).toHaveProperty("deepseek");
      expect(PROVIDER_PRESETS).toHaveProperty("mistral");
      expect(PROVIDER_PRESETS).toHaveProperty("ollama");
    });

    it("should include gemini-3.6-flash in Gemini models list", () => {
      expect(PROVIDER_PRESETS.gemini.models).toContain("gemini-3.6-flash");
    });
  });
});
