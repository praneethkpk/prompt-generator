import React, { useState } from "react";
import Modal, { ModalHeader, ModalTitle, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { PROVIDER_PRESETS, sendAdapterRequest } from "@/services/adapters";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";
import { Scale, Zap, Clock, Copy, Check } from "lucide-react";
import { CopyToClipboard } from "react-copy-to-clipboard";

export default function ModelComparisonModal({ isOpen, onClose, promptToTest, apiKey }) {
  const [selectedProviders, setSelectedProviders] = useState(["gemini", "groq"]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({});

  const toggleProvider = (key) => {
    if (selectedProviders.includes(key)) {
      if (selectedProviders.length === 1) {
        toast.error("Select at least 1 provider");
        return;
      }
      setSelectedProviders(selectedProviders.filter((p) => p !== key));
    } else {
      if (selectedProviders.length >= 3) {
        toast.error("Max 3 providers");
        return;
      }
      setSelectedProviders([...selectedProviders, key]);
    }
  };

  const handleRunComparison = async () => {
    if (!apiKey) {
      toast.error("Enter an API key in Settings first");
      return;
    }
    setIsRunning(true);
    setResults({});
    const newResults = {};

    await Promise.all(
      selectedProviders.map(async (providerKey) => {
        const preset = PROVIDER_PRESETS[providerKey];
        newResults[providerKey] = { status: "loading" };
        setResults({ ...newResults });
        try {
          const res = await sendAdapterRequest({
            providerKey,
            apiKey,
            baseURL: preset.baseURL,
            model: preset.models[0],
            messages: [{ role: "user", content: promptToTest }],
            maxTokens: 500,
          });
          newResults[providerKey] = { status: "success", content: res.content, latencyMs: res.latencyMs, model: preset.models[0] };
        } catch (err) {
          newResults[providerKey] = { status: "error", error: err.message, model: preset.models[0] };
        }
        setResults({ ...newResults });
      })
    );
    setIsRunning(false);
    toast.success("Comparison completed!");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-5xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Scale className="h-5 w-5 text-primary" />
          <ModalTitle>Multi-Model Comparison</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent className="space-y-4">
        {/* Provider Selectors */}
        <div className="p-3 rounded-lg bg-muted space-y-2">
          <label className="text-xs font-medium text-muted-foreground">Select Providers (Max 3):</label>
          <div className="flex flex-wrap gap-2">
            {Object.entries(PROVIDER_PRESETS).map(([key, item]) => {
              const isSelected = selectedProviders.includes(key);
              return (
                <button
                  key={key}
                  onClick={() => toggleProvider(key)}
                  className={`text-xs px-3 py-1.5 rounded-full border transition-all ${
                    isSelected
                      ? "bg-primary/10 border-primary text-primary"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {item.name.replace(" (Ultra-Fast)", "").replace(" AI", "")} {isSelected && "✓"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Run Button */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-muted-foreground">{promptToTest?.length || 0} chars</span>
          <Button onClick={handleRunComparison} disabled={isRunning || !promptToTest} className="gap-2">
            <Zap className={`h-4 w-4 ${isRunning ? "animate-spin" : ""}`} />
            {isRunning ? "Running..." : "Run Comparison"}
          </Button>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[50vh] overflow-y-auto">
          {selectedProviders.map((key) => {
            const res = results[key];
            const preset = PROVIDER_PRESETS[key];
            return (
              <div key={key} className="p-4 rounded-lg bg-muted space-y-3">
                <div className="flex items-center justify-between border-b border-border pb-2">
                  <span className="font-semibold text-sm text-primary">
                    {preset?.name?.replace(" (Ultra-Fast)", "").replace(" AI", "") || key}
                  </span>
                  {res?.latencyMs && (
                    <span className="text-[10px] px-2 py-0.5 rounded bg-primary/10 text-primary font-mono flex items-center gap-1">
                      <Clock className="h-3 w-3" /> {res.latencyMs}ms
                    </span>
                  )}
                </div>
                <div className="flex-1 overflow-auto max-h-[350px] min-h-[150px] text-xs bg-background p-3 rounded border">
                  {!res && <div className="h-full flex items-center justify-center text-muted-foreground">Click Run to start</div>}
                  {res?.status === "loading" && (
                    <div className="h-full flex items-center justify-center gap-2 text-muted-foreground">
                      <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                      Querying...
                    </div>
                  )}
                  {res?.status === "error" && <div className="text-destructive">{res.error}</div>}
                  {res?.status === "success" && (
                    <div className="prose prose-sm max-w-none"><ReactMarkdown>{res.content}</ReactMarkdown></div>
                  )}
                </div>
                <div className="text-[10px] text-muted-foreground font-mono">Model: {res?.model || preset?.models[0]}</div>
              </div>
            );
          })}
        </div>
      </ModalContent>
    </Modal>
  );
}
