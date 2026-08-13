// src/components/PromptOutput.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testPrompt } from "@/services/llmService";
import PromptEvaluator from "./PromptEvaluator";
import { exportPromptMarkdown } from "@/services/historyService";

export default function PromptOutput({ generatedPrompt, inputs, onOpenComparison, apiKey }) {
  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState("");

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

  const handleExportMd = () => {
    exportPromptMarkdown({
      inputs,
      generatedPrompt,
      timestamp: new Date().toISOString(),
      id: `prompt_${Date.now()}`,
    });
    toast.success("Exported prompt as Markdown!");
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-4">
      {/* ── Generated Prompt Card ── */}
      <Card className="shadow-lg border-emerald-500/30 bg-zinc-950">
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
          <CardTitle className="text-xl text-emerald-400 flex items-center gap-2">
            ✨ Engineered Prompt
          </CardTitle>

          <div className="flex flex-wrap gap-2">
            <CopyToClipboard
              text={generatedPrompt}
              onCopy={() => toast.success("Copied prompt to clipboard!")}
            >
              <Button variant="outline" size="sm" className="text-xs border-zinc-700 h-8">
                📋 Copy
              </Button>
            </CopyToClipboard>

            <Button
              variant="outline"
              size="sm"
              onClick={handleExportMd}
              className="text-xs border-zinc-700 h-8"
            >
              📝 .MD
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTxt}
              className="text-xs border-zinc-700 h-8"
            >
              📄 .TXT
            </Button>

            {onOpenComparison && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenComparison}
                className="text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 h-8"
              >
                ⚖️ Compare Models
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white h-8"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? "Testing…" : "🧪 Test Output"}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4">
          <div className="prose prose-invert prose-sm max-w-none rounded-md bg-zinc-900 p-4 overflow-auto max-h-[500px] text-zinc-100 border border-zinc-800">
            <ReactMarkdown>{generatedPrompt}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* ── Prompt Quality Evaluation Scorecard ── */}
      <PromptEvaluator promptText={generatedPrompt} inputs={inputs} />

      {/* ── Test Result Card ── */}
      {testError && (
        <Card className="border-red-500/40 bg-red-500/10 mt-4">
          <CardContent className="pt-4">
            <p className="text-red-400 text-xs font-mono">⚠️ {testError}</p>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card className="shadow-lg border-cyan-500/30 bg-zinc-950 mt-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-zinc-800">
            <CardTitle className="text-base text-cyan-400">
              🔬 Test Response Preview
            </CardTitle>
            <CopyToClipboard
              text={testResult}
              onCopy={() => toast.success("Test response copied!")}
            >
              <Button variant="outline" size="sm" className="text-xs h-7">
                📋 Copy
              </Button>
            </CopyToClipboard>
          </CardHeader>
          <CardContent className="pt-3">
            <div className="prose prose-invert prose-sm max-w-none rounded-md bg-zinc-900 p-4 overflow-auto max-h-[400px] text-zinc-100 border border-zinc-800">
              <ReactMarkdown>{testResult}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
