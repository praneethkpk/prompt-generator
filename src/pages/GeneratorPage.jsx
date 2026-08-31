import React, { useState } from "react";
import { motion } from "framer-motion";
import { Zap, AlertTriangle } from "lucide-react";
import PromptForm from "@/components/PromptForm";
import PromptOutput from "@/components/PromptOutput";
import SettingsModal from "@/components/SettingsModal";
import SecurityPrivacyModal from "@/components/SecurityPrivacyModal";
import PromptTemplatesModal from "@/components/PromptTemplatesModal";
import ModelComparisonModal from "@/components/ModelComparisonModal";
import PromptEvaluator from "@/components/PromptEvaluator";
import { buildMetaPrompt } from "@/prompts/metaPromptTemplate";
import { generatePrompt, testPrompt } from "@/services/llmService";
import { savePromptToHistory } from "@/services/historyService";
import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { useSettingsStore } from "@/store/settingsStore";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { CopyToClipboard } from "react-copy-to-clipboard";
import ReactMarkdown from "react-markdown";
import { Copy, FileText, Download, Scale, FlaskConical, Target, Sparkles } from "lucide-react";

export default function GeneratorPage() {
  const apiKey = useSettingsStore((s) => s.apiKey);
  const activeSettings = {
    model: useSettingsStore((s) => s.model),
    provider: useSettingsStore((s) => s.provider),
  };

  const [generatedPrompt, setGeneratedPrompt] = useState("");
  const [lastInputs, setLastInputs] = useState(null);
  const [initialFormValues, setInitialFormValues] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [apiError, setApiError] = useState("");

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);

  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState("");

  const handleGenerate = async (inputs) => {
    setIsGenerating(true);
    setApiError("");
    setGeneratedPrompt("");
    setLastInputs(inputs);

    try {
      const metaPrompt = buildMetaPrompt(inputs);
      const result = await generatePrompt(metaPrompt, { apiKey });
      setGeneratedPrompt(result);

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

  const handleTest = async () => {
    setIsTesting(true);
    setTestError("");
    setTestResult("");
    try {
      const result = await testPrompt(generatedPrompt, { apiKey });
      setTestResult(result);
      toast.success("Test completed!");
    } catch (err) {
      setTestError(err.message);
      toast.error("Test failed.");
    } finally {
      setIsTesting(false);
    }
  };

  const handleDownloadTxt = () => {
    const blob = new Blob([generatedPrompt], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `engineered-prompt-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Downloaded prompt as TXT!");
  };

  useKeyboardShortcuts({
    onCloseModals: () => {
      setIsSettingsOpen(false);
      setIsSecurityOpen(false);
      setIsTemplatesOpen(false);
      setIsComparisonOpen(false);
    },
    onOpenHistory: () => {},
    onOpenTemplates: () => setIsTemplatesOpen(true),
    onOpenSettings: () => setIsSettingsOpen(true),
  });

  return (
    <div className="space-y-6">
      {/* Modals */}
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} apiKey={apiKey} setApiKey={useSettingsStore.getState().setApiKey} />
      <SecurityPrivacyModal isOpen={isSecurityOpen} onClose={() => setIsSecurityOpen(false)} />
      <PromptTemplatesModal isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} onSelectTemplate={(v) => setInitialFormValues(v)} />
      <ModelComparisonModal isOpen={isComparisonOpen} onClose={() => setIsComparisonOpen(false)} promptToTest={generatedPrompt} apiKey={apiKey} />

      {/* Security Alert Banner */}
      {!apiKey && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 rounded-lg border border-amber-500/30 bg-amber-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-amber-600 dark:text-amber-300"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>
              <strong>Bring Your Own Key (BYOK):</strong> Enter your API key in Settings.
            </span>
          </div>
          <Button
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="h-7 text-xs bg-amber-600 hover:bg-amber-500 text-white font-medium shrink-0"
          >
            Configure Key
          </Button>
        </motion.div>
      )}

      {/* Prompt Form */}
      <PromptForm
        onSubmit={handleGenerate}
        initialValues={initialFormValues}
        onOpenTemplates={() => setIsTemplatesOpen(true)}
      />

      {/* Loading State */}
      {isGenerating && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-12 gap-3"
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
            <Zap className="absolute inset-0 m-auto h-5 w-5 text-primary" />
          </div>
          <p className="text-sm text-muted-foreground">
            Engineering prompt via client-side BYOK connection...
          </p>
        </motion.div>
      )}

      {/* API Error */}
      {apiError && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-lg border border-destructive/40 bg-destructive/10 p-4 space-y-2"
        >
          <p className="text-destructive text-sm font-medium">{apiError}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs border-destructive/40 text-destructive"
          >
            Configure API Key & Model in Settings
          </Button>
        </motion.div>
      )}

      {/* Generated Output */}
      {generatedPrompt && !isGenerating && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-4"
        >
          {/* Prompt Output Card */}
          <div className="rounded-xl border border-primary/30 bg-card shadow-lg overflow-hidden">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-primary flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Engineered Prompt
              </h2>
              <div className="flex flex-wrap gap-2">
                <CopyToClipboard text={generatedPrompt} onCopy={() => toast.success("Copied to clipboard!")}>
                  <Button variant="outline" size="sm" className="text-xs h-8">
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                </CopyToClipboard>
                <Button variant="outline" size="sm" onClick={handleDownloadTxt} className="text-xs h-8">
                  <Download className="h-3.5 w-3.5 mr-1.5" />
                  .TXT
                </Button>
                <Button variant="outline" size="sm" onClick={() => setIsComparisonOpen(true)} className="text-xs h-8 border-cyan-500/40 text-cyan-600 dark:text-cyan-300 hover:bg-cyan-500/10">
                  <Scale className="h-3.5 w-3.5 mr-1.5" />
                  Compare
                </Button>
                <Button variant="default" size="sm" className="text-xs h-8" onClick={handleTest} disabled={isTesting}>
                  <FlaskConical className="h-3.5 w-3.5 mr-1.5" />
                  {isTesting ? "Testing..." : "Test Output"}
                </Button>
              </div>
            </div>
            <div className="px-6 py-4">
              <div className="prose prose-sm max-w-none rounded-lg bg-muted p-4 overflow-auto max-h-[500px">
                <ReactMarkdown>{generatedPrompt}</ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Quality Evaluator */}
          <PromptEvaluator promptText={generatedPrompt} inputs={lastInputs} />

          {/* Test Error */}
          {testError && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/10 p-4">
              <p className="text-destructive text-xs font-mono">{testError}</p>
            </div>
          )}

          {/* Test Result */}
          {testResult && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl border border-cyan-500/30 bg-card shadow-lg overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-3 border-b border-border">
                <h3 className="text-sm font-semibold text-cyan-600 dark:text-cyan-400 flex items-center gap-2">
                  <FlaskConical className="h-4 w-4" />
                  Test Response Preview
                </h3>
                <CopyToClipboard text={testResult} onCopy={() => toast.success("Test response copied!")}>
                  <Button variant="outline" size="sm" className="text-xs h-7">
                    <Copy className="h-3.5 w-3.5 mr-1.5" />
                    Copy
                  </Button>
                </CopyToClipboard>
              </div>
              <div className="px-6 py-4">
                <div className="prose prose-sm max-w-none rounded-lg bg-muted p-4 overflow-auto max-h-[400px]">
                  <ReactMarkdown>{testResult}</ReactMarkdown>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}
