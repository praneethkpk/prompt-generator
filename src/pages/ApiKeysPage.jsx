import React, { useState } from "react";
import { motion } from "framer-motion";
import { Key, Plus, Trash2, Zap, ExternalLink, Check, X } from "lucide-react";
import { PROVIDER_PRESETS, sendAdapterRequest } from "@/services/adapters";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/Badge";
import { toast } from "react-hot-toast";

export default function ApiKeysPage() {
  const settings = useSettingsStore();
  const [isAdding, setIsAdding] = useState(false);
  const [newProvider, setNewProvider] = useState("gemini");
  const [newKey, setNewKey] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);

  const providerList = Object.entries(PROVIDER_PRESETS).filter(([k]) => k !== "custom");
  const currentPreset = PROVIDER_PRESETS[newProvider] || PROVIDER_PRESETS.custom;

  const handleTestConnection = async () => {
    if (!newKey.trim()) {
      toast.error("Enter an API key to test");
      return;
    }
    setIsTesting(true);
    setTestResult(null);
    try {
      const result = await sendAdapterRequest({
        providerKey: newProvider,
        apiKey: newKey.trim(),
        baseURL: currentPreset.baseURL,
        model: currentPreset.models[0],
        messages: [{ role: "user", content: "Reply with 'OK'" }],
        maxTokens: 10,
      });
      setTestResult({ success: true, latency: "N/A" });
      toast.success("Connection successful!");
    } catch (err) {
      setTestResult({ success: false, error: err.message });
      toast.error("Connection failed");
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = () => {
    if (!newKey.trim()) {
      toast.error("Enter an API key");
      return;
    }
    settings.setProvider(newProvider);
    settings.setBaseURL(currentPreset.baseURL);
    settings.setModel(currentPreset.models[0]);
    settings.setApiKey(newKey.trim());
    toast.success(`Activated ${currentPreset.name}`);
    setIsAdding(false);
    setNewKey("");
    setNewLabel("");
    setTestResult(null);
  };

  const handleClearKey = () => {
    settings.setApiKey("");
    toast.success("API key cleared");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">API Keys</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your AI provider API keys. Keys are stored in memory only.
          </p>
        </div>
        {!isAdding && (
          <Button onClick={() => setIsAdding(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Add Key
          </Button>
        )}
      </div>

      {/* Security Notice */}
      <div className="p-3 rounded-lg border border-primary/20 bg-primary/5 text-xs text-primary flex items-start gap-2">
        <Key className="h-4 w-4 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold">In-Memory Security:</span> API keys are stored exclusively in browser memory. They are never written to localStorage or sent to any server.
        </div>
      </div>

      {/* Add Key Form */}
      {isAdding && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-xl border bg-card space-y-4"
        >
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Plus className="h-4 w-4 text-primary" />
            Add New API Key
          </h3>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-medium mb-1.5 text-muted-foreground">Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {providerList.map(([key, preset]) => (
                <button
                  key={key}
                  onClick={() => { setNewProvider(key); setTestResult(null); }}
                  className={`p-3 rounded-lg border text-xs font-medium transition-all ${
                    newProvider === key
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border hover:border-border/80 hover:bg-muted"
                  }`}
                >
                  {preset.name.replace(" (Ultra-Fast)", "").replace(" AI", "")}
                </button>
              ))}
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-medium text-muted-foreground">API Key</label>
              {currentPreset.docsUrl && (
                <a href={currentPreset.docsUrl} target="_blank" rel="noreferrer" className="text-[11px] text-primary hover:underline flex items-center gap-1">
                  Get API Key <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <Input
              type="password"
              placeholder={currentPreset.placeholderKey}
              value={newKey}
              onChange={(e) => { setNewKey(e.target.value); setTestResult(null); }}
            />
          </div>

          {/* Test Result */}
          {testResult && (
            <div className={`p-3 rounded-lg border text-xs ${
              testResult.success
                ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : "border-destructive/30 bg-destructive/10 text-destructive"
            }`}>
              {testResult.success ? (
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5" /> Connection verified</span>
              ) : (
                <span className="flex items-center gap-1.5"><X className="h-3.5 w-3.5" /> {testResult.error}</span>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-1">
            <Button onClick={handleTestConnection} variant="outline" disabled={isTesting} className="gap-2">
              <Zap className={`h-4 w-4 ${isTesting ? "animate-spin" : ""}`} />
              {isTesting ? "Testing..." : "Test Connection"}
            </Button>
            <Button onClick={handleSave} className="gap-2">
              <Check className="h-4 w-4" />
              Save & Activate
            </Button>
            <Button variant="ghost" onClick={() => { setIsAdding(false); setTestResult(null); }}>
              Cancel
            </Button>
          </div>
        </motion.div>
      )}

      {/* Active Key Display */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground">Active Key</h2>
        {settings.apiKey ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-5 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Key className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{PROVIDER_PRESETS[settings.provider]?.name || settings.provider}</p>
                  <p className="text-xs text-muted-foreground font-mono">
                    {settings.apiKey.slice(0, 8)}...{settings.apiKey.slice(-4)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="success">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 inline-block" />
                  Active
                </Badge>
                <Button variant="ghost" size="sm" onClick={handleClearKey} className="text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="p-8 rounded-xl border border-dashed text-center">
            <Key className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground mb-3">No API key configured.</p>
            <Button size="sm" onClick={() => setIsAdding(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Your First Key
            </Button>
          </div>
        )}
      </div>

      {/* Supported Providers */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground mb-3">Supported Providers</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {providerList.map(([key, preset]) => (
            <div key={key} className="p-4 rounded-xl border bg-card">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{preset.name.replace(" (Ultra-Fast)", "").replace(" AI", "")}</span>
                {settings.provider === key && settings.apiKey && (
                  <Badge variant="success">Active</Badge>
                )}
              </div>
              <p className="text-[11px] text-muted-foreground font-mono truncate">
                {preset.baseURL.replace("https://", "")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
