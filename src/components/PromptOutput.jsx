// src/components/PromptOutput.jsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-hot-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { testPrompt } from "@/services/llmService";

/**
 * PromptOutput – renders the generated prompt with:
 * - Markdown formatting
 * - Copy-to-clipboard button
 * - "Test Prompt" button that sends the prompt back to Gemini and shows a preview
 */
export default function PromptOutput({ generatedPrompt }) {
  const [testResult, setTestResult] = useState("");
  const [isTesting, setIsTesting] = useState(false);
  const [testError, setTestError] = useState("");

  const handleTest = async () => {
    setIsTesting(true);
    setTestError("");
    setTestResult("");
    try {
      const result = await testPrompt(generatedPrompt);
      setTestResult(result);
      toast.success("Test completed!");
    } catch (err) {
      setTestError(err.message);
      toast.error("Test failed.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 space-y-4">
      {/* ── Generated Prompt Card ── */}
      <Card className="shadow-lg border-emerald-500/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl text-emerald-400">
            ✨ Generated Prompt
          </CardTitle>
          <div className="flex gap-2">
            <CopyToClipboard
              text={generatedPrompt}
              onCopy={() => toast.success("Copied to clipboard!")}
            >
              <Button variant="outline" size="sm" className="text-xs">
                📋 Copy
              </Button>
            </CopyToClipboard>
            <Button
              variant="secondary"
              size="sm"
              className="text-xs"
              onClick={handleTest}
              disabled={isTesting}
            >
              {isTesting ? (
                <span className="flex items-center gap-1">
                  <svg
                    className="animate-spin h-3 w-3"
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
                  Testing…
                </span>
              ) : (
                "🧪 Test Prompt"
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-invert prose-sm max-w-none rounded-md bg-zinc-900 p-4 overflow-auto max-h-[500px] text-zinc-100">
            <ReactMarkdown>{generatedPrompt}</ReactMarkdown>
          </div>
        </CardContent>
      </Card>

      {/* ── Test Result Card ── */}
      {testError && (
        <Card className="border-red-500/40">
          <CardContent className="pt-6">
            <p className="text-red-400 text-sm">{testError}</p>
          </CardContent>
        </Card>
      )}

      {testResult && (
        <Card className="shadow-lg border-sky-500/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xl text-sky-400">
              🔬 Test Response Preview
            </CardTitle>
            <CopyToClipboard
              text={testResult}
              onCopy={() => toast.success("Test response copied!")}
            >
              <Button variant="outline" size="sm" className="text-xs">
                📋 Copy
              </Button>
            </CopyToClipboard>
          </CardHeader>
          <CardContent>
            <div className="prose prose-invert prose-sm max-w-none rounded-md bg-zinc-900 p-4 overflow-auto max-h-[500px] text-zinc-100">
              <ReactMarkdown>{testResult}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
