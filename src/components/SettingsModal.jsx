// src/components/SettingsModal.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROVIDER_PRESETS } from "@/services/adapters";
import {
  getStoredSettings,
  saveSettings,
  setSessionApiKey,
  getSessionApiKey,
  clearSessionApiKey,
  testConnection,
} from "@/services/llmService";
import { toast } from "react-hot-toast";

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const [provider, setProvider] = useState("gemini");
  const [baseURL, setBaseURL] = useState(PROVIDER_PRESETS.gemini.baseURL);
  const [model, setModel] = useState(PROVIDER_PRESETS.gemini.models[0]);
  const [customModel, setCustomModel] = useState("");
  const [customEndpointsApproved, setCustomEndpointsApproved] = useState([]);
  
  // Connection Testing State
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);

  // Custom Endpoint Confirmation Modal
  const [showCustomWarning, setShowCustomWarning] = useState(false);
  const [pendingCustomURL, setPendingCustomURL] = useState("");

  useEffect(() => {
    const existing = getStoredSettings();
    if (existing) {
      setProvider(existing.provider || "gemini");
      setBaseURL(existing.baseURL || PROVIDER_PRESETS[existing.provider || "gemini"]?.baseURL || "");
      const savedModel = existing.model || PROVIDER_PRESETS[existing.provider || "gemini"]?.models[0] || "";
      setModel(savedModel);
      setCustomEndpointsApproved(existing.customEndpointsApproved || []);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleProviderChange = (e) => {
    const pKey = e.target.value;
    setProvider(pKey);
    setTestStatus(null);
    const preset = PROVIDER_PRESETS[pKey];
    if (preset && pKey !== "custom") {
      setBaseURL(preset.baseURL);
      setModel(preset.models[0] || "");
    } else if (pKey === "custom") {
      setBaseURL("");
      setModel("");
    }
  };

  const handleBaseURLChange = (val) => {
    setBaseURL(val);
    setTestStatus(null);
    if (provider === "custom" && val.trim() && !customEndpointsApproved.includes(val.trim())) {
      setPendingCustomURL(val.trim());
    }
  };

  const handleTestConnectionClick = async () => {
    if (!apiKey.trim() && provider !== "ollama") {
      toast.error("Please enter an API Key to test connection.");
      return;
    }

    // Standardize session key first
    setSessionApiKey(apiKey);
    const finalModel = customModel.trim() || model;

    setIsTesting(true);
    setTestStatus(null);

    const result = await testConnection({
      provider,
      apiKey: apiKey.trim(),
      baseURL: baseURL.trim(),
      model: finalModel.trim(),
    });

    setIsTesting(false);
    setTestStatus(result);

    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(`Connection failed: ${result.error}`);
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

    // Check custom URL warning
    if (provider === "custom" && baseURL.trim() && !customEndpointsApproved.includes(baseURL.trim())) {
      setShowCustomWarning(true);
      return;
    }

    completeSave(finalModel);
  };

  const completeSave = (finalModel) => {
    // 1. Store API key exclusively in-memory
    setSessionApiKey(apiKey.trim());

    // 2. Store non-sensitive settings in localStorage
    saveSettings({
      provider,
      model: finalModel.trim(),
      baseURL: baseURL.trim(),
      customEndpointsApproved,
    });

    toast.success(`Activated: ${PROVIDER_PRESETS[provider]?.name || "Provider"} (${finalModel.trim()})`);
    onClose();
  };

  const confirmCustomEndpoint = () => {
    const updatedApproved = [...customEndpointsApproved, baseURL.trim()];
    setCustomEndpointsApproved(updatedApproved);
    setShowCustomWarning(false);
    completeSave(customModel.trim() || model);
  };

  const handleClearKey = () => {
    clearSessionApiKey();
    setApiKey("");
    setTestStatus(null);
    toast.success("API Key cleared from memory!");
  };

  const handleResetDefaults = () => {
    clearSessionApiKey();
    setApiKey("");
    setProvider("gemini");
    setBaseURL(PROVIDER_PRESETS.gemini.baseURL);
    setModel(PROVIDER_PRESETS.gemini.models[0]);
    setCustomModel("");
    setTestStatus(null);
    saveSettings(null);
    toast.success("Reset to defaults!");
    onClose();
  };

  const presetModels = PROVIDER_PRESETS[provider]?.models || [];
  const currentPreset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      {/* Custom Base URL Warning Modal overlay */}
      {showCustomWarning && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/90">
          <div className="max-w-md w-full p-6 rounded-lg bg-zinc-900 border border-amber-500/50 space-y-4">
            <h3 className="text-lg font-bold text-amber-400 flex items-center gap-2">
              ⚠️ Custom Endpoint Warning
            </h3>
            <p className="text-xs text-zinc-300 leading-relaxed">
              You are configuring a custom API Base URL:
            </p>
            <div className="p-2 rounded bg-zinc-950 font-mono text-xs text-amber-300 break-all border border-zinc-800">
              {baseURL}
            </div>
            <p className="text-xs text-zinc-400">
              Your API key will be sent in standard authorization headers to this custom endpoint. Please confirm you trust this endpoint provider.
            </p>
            <div className="flex gap-2 pt-2">
              <Button
                onClick={confirmCustomEndpoint}
                className="flex-1 bg-amber-600 hover:bg-amber-500 text-white text-xs"
              >
                I Understand &amp; Confirm
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowCustomWarning(false)}
                className="border-zinc-700 text-zinc-400 text-xs"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <Card className="w-full max-w-lg shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800">
          <CardTitle className="text-xl flex items-center gap-2">
            ⚙️ AI Provider &amp; API Key Settings
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
          {/* Security Banner */}
          <div className="p-3 rounded bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-xs flex items-start gap-2">
            <span className="text-base">🔒</span>
            <div>
              <span className="font-semibold block">In-Memory Security Notice:</span>
              Your API key lives exclusively in browser memory during this session. It is <strong>never written to localStorage</strong> or sent to any middleman server.
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-4">
            {/* 1. Select Provider */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  1. Select AI Provider
                </label>
                {currentPreset.docsUrl && (
                  <a
                    href={currentPreset.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    Get API Key ↗
                  </a>
                )}
              </div>
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

            {/* 2. Enter API Key */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-semibold text-zinc-300">
                  2. API Key (In-Memory Session Only)
                </label>
                {apiKey && (
                  <button
                    type="button"
                    onClick={handleClearKey}
                    className="text-[11px] text-red-400 hover:underline"
                  >
                    🗑️ Clear Key
                  </button>
                )}
              </div>
              <Input
                type="password"
                placeholder={currentPreset.placeholderKey}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="bg-zinc-900 border-zinc-700 font-mono text-xs"
              />
            </div>

            {/* 3. Choose Model */}
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
                API Base URL {provider === "custom" ? "(Required)" : "(Advanced)"}
              </label>
              <Input
                type="text"
                placeholder={currentPreset.baseURL || "https://api.openai.com/v1"}
                value={baseURL}
                onChange={(e) => handleBaseURLChange(e.target.value)}
                className="bg-zinc-900 border-zinc-700 font-mono text-xs text-zinc-300"
              />
            </div>

            {/* Connection Testing Button & Badge */}
            <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Verify Connection</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleTestConnectionClick}
                  disabled={isTesting}
                  className="h-7 text-xs border-zinc-700 hover:bg-zinc-800 text-zinc-200"
                >
                  {isTesting ? "Testing…" : "🧪 Test Connection"}
                </Button>
              </div>

              {testStatus && (
                <div
                  className={`text-xs p-2 rounded border font-mono ${
                    testStatus.success
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                      : "bg-red-500/10 border-red-500/30 text-red-300"
                  }`}
                >
                  {testStatus.success ? (
                    <div className="flex items-center justify-between">
                      <span>✓ {testStatus.message}</span>
                      <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded">
                        {testStatus.model}
                      </span>
                    </div>
                  ) : (
                    <div>⚠️ {testStatus.error}</div>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
              <Button
                type="submit"
                className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10"
              >
                💾 Activate Settings
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetDefaults}
                className="border-zinc-700 text-zinc-400 h-10"
              >
                Reset
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
