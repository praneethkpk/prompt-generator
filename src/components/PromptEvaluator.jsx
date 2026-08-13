// src/components/PromptEvaluator.jsx
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { evaluatePrompt } from "@/services/evaluatorService";

export default function PromptEvaluator({ promptText, inputs }) {
  const evaluation = evaluatePrompt(promptText, inputs);
  if (!evaluation) return null;

  const getScoreColor = (score) => {
    if (score >= 8.5) return "text-emerald-400 border-emerald-500/40 bg-emerald-500/10";
    if (score >= 7.0) return "text-cyan-400 border-cyan-500/40 bg-cyan-500/10";
    if (score >= 5.5) return "text-amber-400 border-amber-500/40 bg-amber-500/10";
    return "text-red-400 border-red-500/40 bg-red-500/10";
  };

  const getBarColor = (score) => {
    if (score >= 8.5) return "bg-emerald-400";
    if (score >= 7.0) return "bg-cyan-400";
    if (score >= 5.5) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <Card className="shadow-lg border-zinc-800 bg-zinc-950 mt-4">
      <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-zinc-800/80">
        <div className="flex items-center gap-2">
          <CardTitle className="text-base text-zinc-100 flex items-center gap-2">
            📊 Prompt Quality Evaluation
          </CardTitle>
          <span className="text-xs text-zinc-400 hidden sm:inline">
            (5-Metric Engineering Analysis)
          </span>
        </div>

        <div className={`px-3 py-1 rounded-full border text-sm font-bold font-mono ${getScoreColor(evaluation.overall)}`}>
          Overall: {evaluation.overall} / 10
        </div>
      </CardHeader>

      <CardContent className="pt-4 space-y-4">
        {/* Metric Progress Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evaluation.metrics.map((m) => (
            <div key={m.name} className="p-2.5 rounded bg-zinc-900 border border-zinc-800 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-zinc-200">{m.name}</span>
                <span className="font-mono font-bold text-zinc-300">{m.score} / 10</span>
              </div>

              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getBarColor(m.score)}`}
                  style={{ width: `${m.score * 10}%` }}
                />
              </div>

              <p className="text-[10px] text-zinc-500 truncate">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Actionable Suggestions */}
        <div className="p-3 rounded bg-zinc-900 border border-zinc-800/80 space-y-1.5">
          <h4 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
            <span>💡 Optimization Recommendations</span>
          </h4>
          <ul className="text-xs text-zinc-300 space-y-1 pl-4 list-disc">
            {evaluation.suggestions.map((sug, idx) => (
              <li key={idx} className="leading-relaxed">{sug}</li>
            ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
