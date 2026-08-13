// src/components/SecurityPrivacyModal.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function SecurityPrivacyModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-2xl shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <CardTitle className="text-xl flex items-center gap-2">
            🛡️ Security &amp; Privacy Architecture
          </CardTitle>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-zinc-800"
            aria-label="Close security modal"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="pt-6 space-y-6 text-sm text-zinc-300">
          {/* Architecture Summary Banner */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 space-y-2">
            <h3 className="font-semibold text-emerald-400 flex items-center gap-2">
              <span>🔒 Pure BYOK (Bring Your Own Key) Architecture</span>
            </h3>
            <p className="text-xs leading-relaxed text-emerald-200/90">
              This application is hosted as a static frontend on Netlify. It has zero backend databases or server-side key listeners. Your API keys travel <strong>directly from your browser</strong> to your selected AI provider.
            </p>
          </div>

          {/* Direct Flow Diagram */}
          <div className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 space-y-3">
            <h4 className="font-semibold text-xs tracking-wider uppercase text-zinc-400">Data Flow Architecture</h4>
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-mono">
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700 w-full sm:w-auto">
                <span className="block text-emerald-400 font-bold">Your Browser</span>
                <span className="text-zinc-400 text-[10px]">React Session State</span>
              </div>
              <div className="text-zinc-500 font-bold">➔ Direct Fetch ➔</div>
              <div className="p-2.5 rounded bg-zinc-800 border border-zinc-700 w-full sm:w-auto">
                <span className="block text-cyan-400 font-bold">AI Provider API</span>
                <span className="text-zinc-400 text-[10px]">Gemini / OpenAI / Groq</span>
              </div>
            </div>
            <p className="text-xs text-zinc-400 pt-1">
              ✓ Intermediate Server Touchpoints: <strong>ZERO</strong>
            </p>
          </div>

          {/* Security Table */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-200">Security &amp; Privacy Guarantees</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-medium text-emerald-400">🔑 In-Memory Key Storage</div>
                <div className="text-zinc-400 text-xs">
                  API keys are stored exclusively in temporary React component state. They are <strong>never saved to localStorage</strong> or disk.
                </div>
              </div>
              <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-medium text-emerald-400">🚫 Zero Telemetry or Logging</div>
                <div className="text-zinc-400 text-xs">
                  Your prompts, system messages, and LLM responses are processed locally in your browser session.
                </div>
              </div>
              <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-medium text-emerald-400">🌐 Strict Content Security Policy</div>
                <div className="text-zinc-400 text-xs">
                  Netlify HTTP headers enforce CSP restrictions, preventing unauthorized outbound connections.
                </div>
              </div>
              <div className="p-3 rounded-md bg-zinc-900 border border-zinc-800 space-y-1">
                <div className="font-medium text-emerald-400">⚠️ Custom Endpoint Warnings</div>
                <div className="text-zinc-400 text-xs">
                  Using a custom base URL requires explicit confirmation before sending authorization headers to unverified hosts.
                </div>
              </div>
            </div>
          </div>

          {/* Predefined Approved Endpoints */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-200">Verified Official Endpoints</h4>
            <ul className="text-xs space-y-1 text-zinc-400 font-mono bg-zinc-900 p-3 rounded-md border border-zinc-800">
              <li>• Google Gemini: <span className="text-emerald-400">generativelanguage.googleapis.com</span></li>
              <li>• OpenAI: <span className="text-emerald-400">api.openai.com</span></li>
              <li>• Groq: <span className="text-emerald-400">api.groq.com</span></li>
              <li>• OpenRouter: <span className="text-emerald-400">openrouter.ai</span></li>
              <li>• DeepSeek AI: <span className="text-emerald-400">api.deepseek.com</span></li>
              <li>• Mistral AI: <span className="text-emerald-400">api.mistral.ai</span></li>
              <li>• Local Ollama: <span className="text-emerald-400">localhost:11434</span></li>
            </ul>
          </div>

          <div className="pt-2 flex justify-end">
            <Button onClick={onClose} className="bg-zinc-800 hover:bg-zinc-700 text-white">
              Close Security View
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
