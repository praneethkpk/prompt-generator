// src/App.jsx
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import PromptForm from "@/components/PromptForm";
import PromptOutput from "@/components/PromptOutput";
import SettingsModal from "@/components/SettingsModal";
import SecurityPrivacyModal from "@/components/SecurityPrivacyModal";
import PromptTemplatesModal from "@/components/PromptTemplatesModal";
import PromptHistoryModal from "@/components/PromptHistoryModal";
import ModelComparisonModal from "@/components/ModelComparisonModal";
import { buildMetaPrompt } from "@/prompts/metaPromptTemplate";
import { generatePrompt, getStoredSettings } from "@/services/llmService";
import { savePromptToHistory } from "@/services/historyService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

export default function App() {
  // Session In-Memory State (Never persisted to localStorage)
  const [apiKey, setApiKey] = useState("");
  
  // App UI State
  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [lastInputs, setLastInputs] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");

  // Modal Open States
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const activeSettings = getStoredSettings();

  // Handle Prompt Generation
  const handleGenerate = async (inputs) => {
    setIsGenerating(true);
    setApiError("");
    setGeneratedPrompt("");
    setLastInputs(inputs);

    try {
      const metaPrompt = buildMetaPrompt(inputs);
      const result = await generatePrompt(metaPrompt, { apiKey });
      setGeneratedPrompt(result);
      
      // Save to local prompt history
      savePromptToHistory({
        inputs,
        generatedPrompt: result,
        model: activeSettings?.model || "gemini-3.6-flash",
        provider: activeSettings?.provider || "gemini",
      });

      toast.success("Prompt engineered successfully!");
    } catch (err) {
      setApiError(err.message);
      toast.error(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  // Keyboard Shortcuts Hook
  useKeyboardShortcuts({
    onCloseModals: () => {
      setIsSettingsOpen(false);
      setIsSecurityOpen(false);
      setIsTemplatesOpen(false);
      setIsHistoryOpen(false);
      setIsComparisonOpen(false);
    },
    onOpenHistory: () => setIsHistoryOpen(true),
    onOpenTemplates: () => setIsTemplatesOpen(true),
    onOpenSettings: () => setIsSettingsOpen(true),
  });

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-emerald-500/30">
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

      {/* ── Modals ── */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        setApiKey={setApiKey}
      />

      <SecurityPrivacyModal
        isOpen={isSecurityOpen}
        onClose={() => setIsSecurityOpen(false)}
      />

      <PromptTemplatesModal
        isOpen={isTemplatesOpen}
        onClose={() => setIsTemplatesOpen(false)}
        onSelectTemplate={(templateValues) => setInitialFormValues(templateValues)}
      />

      <PromptHistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onRestorePrompt={(item) => {
          setInitialFormValues(item.inputs);
          setGeneratedPrompt(item.generatedPrompt);
        }}
      />

      <ModelComparisonModal
        isOpen={isComparisonOpen}
        onClose={() => setIsComparisonOpen(false)}
        promptToTest={generatedPrompt}
        apiKey={apiKey}
      />

      {/* ── Header ── */}
      <header className="border-b border-zinc-800 py-3.5 px-4 sticky top-0 bg-background/95 backdrop-blur z-40">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                ⚡ Prompt Generator
              </span>
            </h1>
            <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono hidden md:inline-block">
              v2.0 BYOK Security Certified
            </span>
          </div>

          {/* Quick Action Navigation Toolbar */}
          <div className="flex items-center flex-wrap gap-1.5 justify-center sm:justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTemplatesOpen(true)}
              className="border-zinc-800 text-xs h-8 px-2.5 text-zinc-300 hover:bg-zinc-800"
              title="Browse Templates (Ctrl+Shift+T)"
            >
              📚 Templates
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsHistoryOpen(true)}
              className="border-zinc-800 text-xs h-8 px-2.5 text-zinc-300 hover:bg-zinc-800"
              title="Prompt History (Ctrl+Shift+H)"
            >
              📜 History
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSecurityOpen(true)}
              className="border-zinc-800 text-xs h-8 px-2.5 text-emerald-400 hover:bg-zinc-800"
              title="Security & Privacy Policy"
            >
              🛡️ Security
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="border-zinc-700 text-xs flex items-center gap-1.5 h-8 px-3"
              title="Provider Settings (Ctrl+Shift+S)"
            >
              <span>⚙️ Settings</span>
              {apiKey ? (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" title="Session Key Active" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-amber-400" title="Key required for BYOK" />
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="max-w-4xl mx-auto px-4 pb-16 pt-4">
        {/* Security Alert Banner */}
        {!apiKey && (
          <div className="max-w-2xl mx-auto mb-4 p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex items-center justify-between text-xs text-amber-300">
            <div className="flex items-center gap-2">
              <span>🔑</span>
              <span>
                <strong>Bring Your Own Key (BYOK):</strong> Enter your API key in Settings. Keys live strictly in memory and are never saved to disk.
              </span>
            </div>
            <Button
              size="sm"
              onClick={() => setIsSettingsOpen(true)}
              className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium"
            >
              Configure Key
            </Button>
          </div>
        )}

        <PromptForm
          onSubmit={handleGenerate}
          initialValues={initialFormValues}
          onOpenTemplates={() => setIsTemplatesOpen(true)}
        />

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
              Engineering prompt via client-side BYOK connection…
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
              ⚙️ Configure API Key &amp; Model in Settings
            </Button>
          </div>
        )}

        {/* Generated Output */}
        {generatedPrompt && !isGenerating && (
          <PromptOutput
            generatedPrompt={generatedPrompt}
            inputs={lastInputs}
            apiKey={apiKey}
            onOpenComparison={() => setIsComparisonOpen(true)}
          />
        )}
      </main>

      {/* ── Footer ── */}
      <footer className="border-t border-zinc-800 py-4 text-center text-xs text-muted-foreground space-y-1">
        <div>
          BYOK Security Model &middot; Zero Storage Guarantee &middot; Client-Side Direct Connections
        </div>
        <div className="text-[10px] text-zinc-600">
          Keyboard Shortcuts: <kbd className="px-1 bg-zinc-800 rounded">Ctrl+Enter</kbd> Generate &middot; <kbd className="px-1 bg-zinc-800 rounded">Ctrl+Shift+T</kbd> Templates &middot; <kbd className="px-1 bg-zinc-800 rounded">Ctrl+Shift+H</kbd> History
        </div>
      </footer>
    </div>
  );
}
