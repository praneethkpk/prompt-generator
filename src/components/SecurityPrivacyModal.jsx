import React from "react";
import Modal, { ModalHeader, ModalTitle, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Eye, Globe, AlertTriangle, Check } from "lucide-react";

export default function SecurityPrivacyModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-2xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <ModalTitle>Security & Privacy Architecture</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent className="space-y-6">
        {/* Architecture Banner */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <h3 className="font-semibold text-primary flex items-center gap-2">
            <Lock className="h-4 w-4" />
            Pure BYOK (Bring Your Own Key) Architecture
          </h3>
          <p className="text-xs leading-relaxed text-muted-foreground">
            This application is hosted as a static frontend. It has zero backend databases or server-side key listeners. Your API keys travel <strong>directly from your browser</strong> to your selected AI provider.
          </p>
        </div>

        {/* Data Flow */}
        <div className="p-4 rounded-lg bg-muted space-y-3">
          <h4 className="font-semibold text-xs tracking-wider uppercase text-muted-foreground">Data Flow</h4>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs font-mono">
            <div className="p-2.5 rounded bg-background border w-full sm:w-auto">
              <span className="block text-primary font-bold">Your Browser</span>
              <span className="text-muted-foreground text-[10px]">In-Memory State</span>
            </div>
            <div className="text-muted-foreground font-bold">&rarr; Direct Fetch &rarr;</div>
            <div className="p-2.5 rounded bg-background border w-full sm:w-auto">
              <span className="block text-primary font-bold">AI Provider API</span>
              <span className="text-muted-foreground text-[10px]">Gemini / OpenAI / Groq</span>
            </div>
          </div>
        </div>

        {/* Security Guarantees */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { icon: Lock, title: "In-Memory Key Storage", desc: "API keys stored in browser memory only. Never saved to localStorage." },
            { icon: Eye, title: "No Telemetry", desc: "No tracking scripts, analytics, or backend logging." },
            { icon: Globe, title: "Static Content Security", desc: "CSP headers restrict connections to verified provider domains." },
            { icon: AlertTriangle, title: "Custom Endpoint Warnings", desc: "Custom URLs require explicit user approval with HTTPS enforcement." },
          ].map((item) => (
            <div key={item.title} className="p-3 rounded-lg bg-muted space-y-1">
              <div className="font-medium text-sm flex items-center gap-1.5">
                <item.icon className="h-4 w-4 text-primary" />
                {item.title}
              </div>
              <p className="text-xs text-muted-foreground">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Verified Endpoints */}
        <div>
          <h4 className="font-semibold text-sm mb-2">Verified Endpoints</h4>
          <ul className="text-xs space-y-1 text-muted-foreground font-mono bg-muted p-3 rounded-lg">
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> Google Gemini: generativelanguage.googleapis.com</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> OpenAI: api.openai.com</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> Groq: api.groq.com</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> OpenRouter: openrouter.ai</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> DeepSeek: api.deepseek.com</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> Mistral: api.mistral.ai</li>
            <li className="flex items-center gap-2"><Check className="h-3 w-3 text-primary shrink-0" /> Local Ollama: localhost:11434</li>
          </ul>
        </div>
      </ModalContent>
    </Modal>
  );
}
