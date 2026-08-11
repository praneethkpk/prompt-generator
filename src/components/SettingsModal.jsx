// src/components/SettingsModal.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getStoredSettings, saveSettings } from "@/services/llmService";
import { toast } from "react-hot-toast";

export const PROVIDER_PRESETS = {
  openai: {
    name: "OpenAI",
    baseURL: "https://api.openai.com/v1",
    models: ["gpt-4o-mini", "gpt-4o", "gpt-4-turbo"],
    placeholderKey: "sk-proj-...",
  },
  gemini: {
    name: "Google Gemini",
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
    models: ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-1.5-pro"],
    placeholderKey: "AQ.Ab8RN...",
  },
  groq: {
    name: "Groq (Ultra-Fast)",
    baseURL: "https://api.groq.com/openai/v1",
    models: ["llama-3.3-70b-versatile", "llama-3.1-8b-instant", "mixtral-8x7b-32768"],
    placeholderKey: "gsk_...",
  },
  deepseek: {
    name: "DeepSeek AI",
    baseURL: "https://api.deepseek.com/v1",
    models: ["deepseek-chat", "deepseek-reasoner"],
    placeholderKey: "sk-...",
  },
  ollama: {
    name: "Local Ollama",
    baseURL: "http://localhost:11434/v1",
    models: ["llama3", "qwen2.5-coder", "mistral"],
    placeholderKey: "ollama (not required)",
  },
  custom: {
    name: "Custom OpenAI-Compatible Provider",
    baseURL: "",
    models: [],
    placeholderKey: "your-api-key",
  },
};

export default function SettingsModal({ isOpen, onClose }) {
  const [provider, setProvider] = useState("openai");
  const [apiKey, setApiKey] = useState("");
  const [baseURL, setBaseURL] = useState(PROVIDER_PRESETS.openai.baseURL);
  const [model, setModel] = useState(PROVIDER_PRESETS.openai.models[0]);
  const [customModel, setCustomModel] = useState("");

  useEffect(() => {
    const existing = getStoredSettings();
    if (existing) {
      setApiKey(existing.apiKey || "");
      setBaseURL(existing.baseURL || PROVIDER_PRESETS.openai.baseURL);
      const savedModel = existing.model || PROVIDER_PRESETS.openai.models[0];
      setModel(savedModel);
      setProvider(existing.provider || "custom");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (e) => {
    const pKey = e.target.value;
    setProvider(pKey);
    const preset = PROVIDER_PRESETS[pKey];
    if (preset && pKey !== "custom") {
      setBaseURL(preset.baseURL);
      setModel(preset.models[0] || "");
    }
  };

  const handleSave = (e) => {
    e.preventDefault();
    const finalModel = customModel.trim() || model;

    if (!apiKey.trim() && provider !== "ollama") {
      toast.error("Please enter an API Key.");
      return;
    }

    if (!finalModel.trim()) {
      toast.error("Please select or enter a Model Name.");
      return;
    }

    saveSettings({
      provider,
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: finalModel.trim(),
    });

    toast.success(`Active Model: ${finalModel.trim()}`);
    onClose();
  };

  const handleClear = () => {
    saveSettings(null);
    setApiKey("");
    setProvider("openai");
    setBaseURL(PROVIDER_PRESETS.openai.baseURL);
    setModel(PROVIDER_PRESETS.openai.models[0]);
    setCustomModel("");
    toast.success("Reset to default server settings!");
    onClose();
  };

  const presetModels = PROVIDER_PRESETS[provider]?.models || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-lg shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800">
          <CardTitle className="text-xl flex items-center gap-2">
            ⚙️ AI Provider &amp; Key Settings
          </CardTitle>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-zinc-800"
            aria-label="Close settings"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          <p className="text-xs text-zinc-400">
            Configure your API key and model here. Works on both phone and laptop. Keys are stored safely in your device's browser memory.
          </p>

          <form onSubmit={handleSave} className="space-y-4">
            {/* Provider Preset Select */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">
                1. Select Provider
              </label>
              <select
                value={provider}
                onChange={handleProviderChange}
                className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                {Object.entries(PROVIDER_PRESETS).map(([key, item]) => (
                  <option key={key} value={key}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>

            {/* API Key Input */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">
                2. Enter API Key
              </label>
              <Input
                type="password"
                placeholder={PROVIDER_PRESETS[provider]?.placeholderKey || "Paste your API key here"}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-zinc-900 border-zinc-700 font-mono text-xs"
              />
            </div>

            {/* Model Selection */}
            <div>
              <label className="block text-xs font-semibold mb-1.5 text-zinc-300">
                3. Choose Model
              </label>
              {presetModels.length > 0 ? (
                <div className="space-y-2">
                  <select
                    value={model}
                    onChange={(e) => {
                      setModel(e.target.value);
                      setCustomModel("");
                    }}
                    className="w-full h-10 px-3 rounded-md bg-zinc-900 border border-zinc-700 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {presetModels.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                    <option value="custom">Other (Custom model name)...</option>
                  </select>

                  {model === "custom" && (
                    <Input
                      type="text"
                      placeholder="Type custom model name (e.g. gpt-4o)"
                      value={customModel}
                      onChange={(e) => setCustomModel(e.target.value)}
                      className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                    />
                  )}
                </div>
              ) : (
                <Input
                  type="text"
                  placeholder="e.g. gpt-4o-mini, llama-3.3-70b-versatile"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="bg-zinc-900 border-zinc-700 font-mono text-xs"
                />
              )}
            </div>

            {/* Base URL (Advanced) */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-zinc-400">
                API Base URL (Advanced)
              </label>
              <Input
                type="text"
                placeholder="https://api.openai.com/v1"
                value={baseURL}
                onChange={(e) => setBaseURL(e.target.value)}
                className="bg-zinc-900 border-zinc-700 font-mono text-xs text-zinc-400"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10">
                💾 Save &amp; Activate Key
              </Button>
              <Button type="button" variant="outline" onClick={handleClear} className="border-zinc-700 text-zinc-400 h-10">
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
