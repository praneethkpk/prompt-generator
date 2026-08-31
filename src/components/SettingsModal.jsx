import React, { useState, useEffect } from "react";
import Modal, { ModalHeader, ModalTitle, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROVIDER_PRESETS, testAdapterConnection } from "@/services/adapters";
import { useSettingsStore } from "@/store/settingsStore";
import { toast } from "react-hot-toast";
import { Key, Zap, Trash2, RotateCcw, Check } from "lucide-react";

export default function SettingsModal({ isOpen, onClose, apiKey, setApiKey }) {
  const settings = useSettingsStore();
  const [provider, setProvider] = useState(settings.provider);
  const [baseURL, setBaseURL] = useState(settings.baseURL);
  const [model, setModel] = useState(settings.model);
  const [customModel, setCustomModel] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testStatus, setTestStatus] = useState(null);
  const [showCustomWarning, setShowCustomWarning] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setProvider(settings.provider);
      setBaseURL(settings.baseURL);
      setModel(settings.model);
      setTestStatus(null);
    }
  }, [isOpen, settings.provider, settings.baseURL, settings.model]);

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

  const handleSave = () => {
    const finalModel = customModel.trim() || model;
    if (!apiKey.trim() && provider !== "ollama") {
      toast.error("Please enter an API Key.");
      return;
    }
    if (!finalModel.trim()) {
      toast.error("Please select or enter a Model Name.");
      return;
    }
    settings.activateSettings(provider, finalModel.trim(), baseURL.trim(), apiKey.trim());
    toast.success(`Activated: ${PROVIDER_PRESETS[provider]?.name || "Provider"} (${finalModel.trim()})`);
    onClose();
  };

  const handleTestConnection = async () => {
    if (!apiKey.trim() && provider !== "ollama") {
      toast.error("Enter an API key to test");
      return;
    }
    setIsTesting(true);
    setTestStatus(null);
    const finalModel = customModel.trim() || model;
    try {
      const result = await testAdapterConnection({ providerKey: provider, apiKey: apiKey.trim(), baseURL: baseURL.trim(), model: finalModel.trim() });
      setTestStatus(result);
      if (result.success) toast.success(result.message);
      else toast.error(`Failed: ${result.error}`);
    } catch (err) {
      setTestStatus({ success: false, error: err.message });
    } finally {
      setIsTesting(false);
    }
  };

  const handleClearKey = () => {
    setApiKey("");
    settings.setApiKey("");
    setTestStatus(null);
    toast.success("API Key cleared!");
  };

  const handleReset = () => {
    settings.resetDefaults();
    setApiKey("");
    setProvider("gemini");
    setBaseURL(PROVIDER_PRESETS.gemini.baseURL);
    setModel(PROVIDER_PRESETS.gemini.models[0]);
    setCustomModel("");
    setTestStatus(null);
    toast.success("Reset to defaults!");
    onClose();
  };

  const presetModels = PROVIDER_PRESETS[provider]?.models || [];
  const currentPreset = PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-lg">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Key className="h-5 w-5 text-primary" />
          <ModalTitle>AI Provider & API Key Settings</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent>
        <div className="space-y-4">
          {/* Security Banner */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 text-xs text-primary flex items-start gap-2">
            <Key className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">In-Memory Security:</span>
              Your API key lives in browser memory only. Never saved to disk.
            </div>
          </div>

          {/* Provider */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium">1. Select AI Provider</label>
              {currentPreset.docsUrl && (
                <a href={currentPreset.docsUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline">
                  Get API Key
                </a>
              )}
            </div>
            <select value={provider} onChange={handleProviderChange} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
              {Object.entries(PROVIDER_PRESETS).map(([key, item]) => (
                <option key={key} value={key}>{item.name}</option>
              ))}
            </select>
          </div>

          {/* API Key */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-sm font-medium">2. API Key</label>
              {apiKey && (
                <button type="button" onClick={handleClearKey} className="text-[11px] text-destructive hover:underline flex items-center gap-1">
                  <Trash2 className="h-3 w-3" /> Clear
                </button>
              )}
            </div>
            <Input type="password" placeholder={currentPreset.placeholderKey} value={apiKey} onChange={(e) => setApiKey(e.target.value)} />
          </div>

          {/* Model */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">3. Choose Model</label>
            {presetModels.length > 0 ? (
              <div className="space-y-2">
                <select value={model} onChange={(e) => { setModel(e.target.value); setCustomModel(""); }} className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring">
                  {presetModels.map((m) => (<option key={m} value={m}>{m}</option>))}
                  <option value="custom">Custom model...</option>
                </select>
                {model === "custom" && (
                  <Input type="text" placeholder="Enter custom model name" value={customModel} onChange={(e) => setCustomModel(e.target.value)} />
                )}
              </div>
            ) : (
              <Input type="text" placeholder="e.g. gpt-4o" value={model} onChange={(e) => setModel(e.target.value)} />
            )}
          </div>

          {/* Base URL */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">API Base URL</label>
            <Input type="text" placeholder={currentPreset.baseURL} value={baseURL} onChange={(e) => setBaseURL(e.target.value)} />
          </div>

          {/* Test Connection */}
          <div className="p-3 rounded-lg bg-muted space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Verify Connection</span>
              <Button type="button" variant="outline" size="sm" onClick={handleTestConnection} disabled={isTesting} className="h-7 text-xs">
                <Zap className={`h-3.5 w-3.5 mr-1 ${isTesting ? "animate-spin" : ""}`} />
                {isTesting ? "Testing..." : "Test"}
              </Button>
            </div>
            {testStatus && (
              <div className={`text-xs p-3 rounded-lg border font-mono ${testStatus.success ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400" : "bg-destructive/10 border-destructive/30 text-destructive"}`}>
                {testStatus.success ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between font-bold">
                      <span className="flex items-center gap-1"><Check className="h-3.5 w-3.5" /> Connection Successful</span>
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] pt-1 border-t border-emerald-500/20">
                      <div>Latency: {testStatus.latencyMs} ms</div>
                      <div>Model: {testStatus.model}</div>
                    </div>
                  </div>
                ) : (
                  <div>Failed: {testStatus.error}</div>
                )}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} className="flex-1 gap-2">
              <Check className="h-4 w-4" />
              Activate Settings
            </Button>
            <Button type="button" variant="outline" onClick={handleReset} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </ModalContent>
    </Modal>
  );
}
