// src/components/ModelComparisonModal.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PROVIDER_PRESETS, sendAdapterRequest } from "@/services/adapters";
import { getSessionApiKey } from "@/services/llmService";
import ReactMarkdown from "react-markdown";
import { toast } from "react-hot-toast";

export default function ModelComparisonModal({ isOpen, onClose, promptToTest, apiKey }) {
  const [selectedProviders, setSelectedProviders] = useState(["gemini", "groq"]);
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState({});

  if (!isOpen) return null;

  const toggleProvider = (key) => {
    if (selectedProviders.includes(key)) {
      if (selectedProviders.length === 1) {
        toast.error("Please select at least 1 provider.");
        return;
      }
      setSelectedProviders(selectedProviders.filter((p) => p !== key));
    } else {
      if (selectedProviders.length >= 3) {
        toast.error("You can compare up to 3 providers simultaneously.");
        return;
      }
      setSelectedProviders([...selectedProviders, key]);
    }
  };

  const handleRunComparison = async () => {
    const keyToUse = apiKey || getSessionApiKey();
    if (!keyToUse && !selectedProviders.every((p) => p === "ollama")) {
      toast.error("Please enter an API key in Settings to run multi-model comparison.");
      return;
    }

    setIsRunning(true);
    setResults({});

    const newResults = {};

    await Promise.all(
      selectedProviders.map(async (providerKey) => {
        const preset = PROVIDER_PRESETS[providerKey];
        const model = preset.models[0];
        const baseURL = preset.baseURL;

        newResults[providerKey] = { status: "loading" };
        setResults({ ...newResults });

        try {
          const res = await sendAdapterRequest({
            providerKey,
            apiKey: keyToUse,
            baseURL,
            model,
            messages: [{ role: "user", content: promptToTest }],
            maxTokens: 500,
          });

          newResults[providerKey] = {
            status: "success",
            content: res.content,
            latencyMs: res.latencyMs,
            model,
          };
        } catch (err) {
          newResults[providerKey] = {
            status: "error",
            error: err.message,
            model,
          };
        }
        setResults({ ...newResults });
      })
    );

    setIsRunning(false);
    toast.success("Model comparison completed!");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-5xl shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[92vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              ⚖️ Multi-Model Comparison Engine
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Benchmark prompt responses across Gemini, OpenAI, Groq, DeepSeek &amp; Ollama simultaneously.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-zinc-800"
            aria-label="Close comparison modal"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Provider Selectors */}
          <div className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
            <label className="block text-xs font-semibold text-zinc-300">
              Select Providers to Compare (Max 3):
            </label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(PROVIDER_PRESETS).map(([key, item]) => {
                const isSelected = selectedProviders.includes(key);
                return (
                  <button
                    key={key}
                    onClick={() => toggleProvider(key)}
                    className={`text-xs px-3 py-1.5 rounded-md border font-medium transition-all ${
                      isSelected
                        ? "bg-emerald-600/20 border-emerald-500/50 text-emerald-300 shadow-sm"
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700"
                    }`}
                  >
                    {item.name} {isSelected && "✓"}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action Trigger */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-zinc-400">
              Prompt length: {promptToTest?.length || 0} chars
            </span>
            <Button
              onClick={handleRunComparison}
              disabled={isRunning || !promptToTest}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-9 px-4 font-semibold"
            >
              {isRunning ? "Benchmarking Models..." : "⚡ Run Side-by-Side Comparison"}
            </Button>
          </div>

          {/* Comparison Output Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {selectedProviders.map((key) => {
              const res = results[key];
              const preset = PROVIDER_PRESETS[key];

              return (
                <div
                  key={key}
                  className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="font-semibold text-sm text-emerald-400">
                      {preset?.name || key}
                    </span>
                    {res?.latencyMs && (
                      <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 font-mono border border-emerald-500/20">
                        ⏱️ {res.latencyMs} ms
                      </span>
                    )}
                  </div>

                  <div className="flex-1 overflow-auto max-h-[350px] min-h-[150px] text-xs text-zinc-200 bg-zinc-950 p-3 rounded border border-zinc-800/80">
                    {!res && (
                      <div className="h-full flex items-center justify-center text-zinc-600 text-center">
                        Click 'Run Side-by-Side Comparison' to start
                      </div>
                    )}

                    {res?.status === "loading" && (
                      <div className="h-full flex flex-col items-center justify-center gap-2 text-zinc-400">
                        <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        <span>Querying {preset?.models[0]}...</span>
                      </div>
                    )}

                    {res?.status === "error" && (
                      <div className="text-red-400 p-2 text-xs">
                        ⚠️ {res.error}
                      </div>
                    )}

                    {res?.status === "success" && (
                      <div className="prose prose-invert prose-xs max-w-none">
                        <ReactMarkdown>{res.content}</ReactMarkdown>
                      </div>
                    )}
                  </div>

                  <div className="text-[10px] text-zinc-500 flex justify-between font-mono pt-1">
                    <span>Model: {res?.model || preset?.models[0]}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
