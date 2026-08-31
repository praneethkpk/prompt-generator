import React from "react";
import { motion } from "framer-motion";
import { BarChart3, Lightbulb } from "lucide-react";
import { evaluatePrompt } from "@/services/evaluatorService";

export default function PromptEvaluator({ promptText, inputs }) {
  const evaluation = evaluatePrompt(promptText, inputs);
  if (!evaluation) return null;

  const getScoreColor = (score) => {
    if (score >= 8.5) return "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 7.0) return "text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    if (score >= 5.5) return "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-destructive border-destructive/30 bg-destructive/10";
  };

  const getBarColor = (score) => {
    if (score >= 8.5) return "bg-emerald-500";
    if (score >= 7.0) return "bg-cyan-500";
    if (score >= 5.5) return "bg-amber-500";
    return "bg-destructive";
  };

  const getOverallColor = (score) => {
    if (score >= 8.5) return "text-emerald-600 dark:text-emerald-400 border-emerald-500/30 bg-emerald-500/10";
    if (score >= 7.0) return "text-cyan-600 dark:text-cyan-400 border-cyan-500/30 bg-cyan-500/10";
    if (score >= 5.5) return "text-amber-600 dark:text-amber-400 border-amber-500/30 bg-amber-500/10";
    return "text-destructive border-destructive/30 bg-destructive/10";
  };

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h3 className="text-sm font-semibold">Quality Evaluation</h3>
          <span className="text-xs text-muted-foreground hidden sm:inline">(5-Metric Analysis)</span>
        </div>
        <div className={`px-3 py-1 rounded-full border text-sm font-bold font-mono ${getOverallColor(evaluation.overall)}`}>
          {evaluation.overall} / 10
        </div>
      </div>

      <div className="p-6 space-y-5">
        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {evaluation.metrics.map((m) => (
            <div key={m.name} className="p-3 rounded-lg bg-muted space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium">{m.name}</span>
                <span className="font-mono font-bold">{m.score} / 10</span>
              </div>
              <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${getBarColor(m.score)}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${m.score * 10}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground">{m.desc}</p>
            </div>
          ))}
        </div>

        {/* Suggestions */}
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
          <h4 className="text-xs font-semibold text-primary flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5" />
            Optimization Recommendations
          </h4>
          <ul className="text-xs text-muted-foreground space-y-1 pl-5 list-disc">
            {evaluation.suggestions.map((sug, idx) => (
              <li key={idx} className="leading-relaxed">{sug}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
