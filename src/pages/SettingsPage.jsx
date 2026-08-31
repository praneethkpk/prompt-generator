import React, { useState } from "react";
import { motion } from "framer-motion";
import { Settings, RotateCcw, Check } from "lucide-react";
import { PROVIDER_PRESETS } from "@/services/adapters";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [model, setModel] = useState(settings.model);
  const [baseURL, setBaseURL] = useState(settings.baseURL);
  const [customModel, setCustomModel] = useState("");

  const preset = PROVIDER_PRESETS[settings.provider] || PROVIDER_PRESETS.custom;
  const presetModels = preset?.models || [];

  const handleSave = () => {
    const finalModel = customModel.trim() || model;
    settings.setModel(finalModel);
    settings.setBaseURL(baseURL);
    toast.success("Settings saved!");
  };

  const handleReset = () => {
    settings.resetDefaults();
    setModel(PROVIDER_PRESETS.gemini.models[0]);
    setBaseURL(PROVIDER_PRESETS.gemini.baseURL);
    setCustomModel("");
    toast.success("Reset to defaults");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Configure your AI provider and model preferences.
        </p>
      </div>

      {/* Provider Info */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 rounded-xl border bg-card space-y-4"
      >
        <h3 className="font-semibold text-sm flex items-center gap-2">
          <Settings className="h-4 w-4 text-primary" />
          Current Provider
        </h3>
        <div className="p-4 rounded-lg bg-muted">
          <p className="text-sm font-medium">{preset?.name || settings.provider}</p>
          <p className="text-xs text-muted-foreground font-mono mt-1">{settings.baseURL}</p>
        </div>
      </motion.div>

      {/* Model Selection */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 rounded-xl border bg-card space-y-4"
      >
        <h3 className="font-semibold text-sm">Model</h3>
        {presetModels.length > 0 ? (
          <div className="space-y-2">
            <select
              value={model}
              onChange={(e) => { setModel(e.target.value); setCustomModel(""); }}
              className="w-full h-10 px-3 rounded-md border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              {presetModels.map((m) => (
                <option key={m} value={m}>{m}</option>
              ))}
              <option value="custom">Custom model name...</option>
            </select>
            {model === "custom" && (
              <Input
                type="text"
                placeholder="Enter custom model name"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
              />
            )}
          </div>
        ) : (
          <Input
            type="text"
            placeholder="e.g. gpt-4o-mini"
            value={model}
            onChange={(e) => setModel(e.target.value)}
          />
        )}
      </motion.div>

      {/* Base URL */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="p-5 rounded-xl border bg-card space-y-4"
      >
        <h3 className="font-semibold text-sm">API Base URL</h3>
        <Input
          type="text"
          placeholder={preset?.baseURL || "https://api.openai.com/v1"}
          value={baseURL}
          onChange={(e) => setBaseURL(e.target.value)}
        />
        <p className="text-[11px] text-muted-foreground">
          Advanced: Override the default endpoint URL for your provider.
        </p>
      </motion.div>

      {/* Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-3"
      >
        <Button onClick={handleSave} className="gap-2">
          <Check className="h-4 w-4" />
          Save Settings
        </Button>
        <Button variant="outline" onClick={handleReset} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Reset to Defaults
        </Button>
      </motion.div>
    </div>
  );
}
