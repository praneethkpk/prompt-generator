// src/App.jsx
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import PromptForm from "@/components/PromptForm";
import PromptOutput from "@/components/PromptOutput";
import SettingsModal from "@/components/SettingsModal";
import { buildMetaPrompt } from "@/prompts/metaPromptTemplate";
import { generatePrompt, getStoredSettings } from "@/services/llmService";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function App() {
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const activeSettings = getStoredSettings();

  const handleGenerate = async (inputs) => {
    setIsGenerating(true);
    setApiError("");
    setGeneratedPrompt("");

    try {
      const metaPrompt = buildMetaPrompt(inputs);
      const result = await generatePrompt(metaPrompt);
      setGeneratedPrompt(result);
      toast.success("Prompt generated successfully!");
    } catch (err) {
      setApiError(err.message);
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "hsl(240 10% 8%)",
            color: "hsl(0 0% 98%)",
            border: "1px solid hsl(240 3.7% 15.9%)",
          },
        }}
      />

      {/* ── Settings Modal ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* ── Header ── */}
      <header className="border-b border-zinc-800 py-3.5 px-4 sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                ⚡ Prompt Generator
              </span>
            </h1>
            <p className="text-xs text-muted-foreground hidden sm:block">
              Engineered meta-prompts for OpenAI, Gemini, Groq, DeepSeek &amp; Ollama
            </p>
          </div>

          <div className="flex items-center gap-2">
            {activeSettings ? (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono hidden xs:inline-block">
                {activeSettings.model || "Active"}
              </span>
            ) : (
              <span className="text-xs px-2.5 py-1 rounded-full bg-zinc-800 text-zinc-400 font-mono hidden xs:inline-block">
                Server Proxy
              </span>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="border-zinc-700 text-xs flex items-center gap-1.5 h-8 px-3"
            >
              <span>⚙️</span>
              <span className="hidden sm:inline">Settings</span>
              {activeSettings && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-3xl mx-auto px-4 pb-16 pt-2">
        <PromptForm onSubmit={handleGenerate} />

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center mt-8 gap-3">
            <svg
              className="animate-spin h-8 w-8 text-emerald-400"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <p className="text-sm text-muted-foreground">
              Generating your engineered prompt…
            </p>
          </div>
        )}

        {/* API Error */}
        {apiError && !isGenerating && (
          <div className="max-w-2xl mx-auto mt-6 rounded-md border border-red-500/40 bg-red-500/10 p-4 space-y-2">
            <p className="text-red-400 text-sm font-medium">⚠️ {apiError}</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs border-red-500/40 text-red-300"
            >
              ⚙️ Tap here to configure API Key &amp; Model in Settings
            </Button>
          </div>
        )}

        {/* Generated Output */}
        {generatedPrompt && !isGenerating && (
          <PromptOutput generatedPrompt={generatedPrompt} />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-muted-foreground">
        Mobile &amp; Laptop Ready &middot; ⚙️ Tap Settings to configure your key &amp; model
      </footer>
    </div>
  );
}
