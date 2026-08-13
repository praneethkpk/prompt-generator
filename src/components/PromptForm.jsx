// src/components/PromptForm.jsx
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

const CHAR_LIMITS = {
  role: 200,
  context: 5000,
  task: 5000,
  outputFormat: 2000,
};

export default function PromptForm({ onSubmit, initialValues, onOpenTemplates }) {
  const [role, setRole] = useState("");
  const [context, setContext] = useState("");
  const [task, setTask] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialValues) {
      if (initialValues.role !== undefined) setRole(initialValues.role);
      if (initialValues.context !== undefined) setContext(initialValues.context);
      if (initialValues.task !== undefined) setTask(initialValues.task);
      if (initialValues.outputFormat !== undefined) setOutputFormat(initialValues.outputFormat);
    }
  }, [initialValues]);

  /** Escape XML/HTML special characters to prevent prompt injection. */
  const escapeXml = (unsafe) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const newErrors = {};
    if (!role.trim()) newErrors.role = "Role is required";
    if (!context.trim()) newErrors.context = "Context is required";
    if (!task.trim()) newErrors.task = "Task is required";
    if (!outputFormat.trim()) newErrors.outputFormat = "Desired output format is required";

    if (role.length > CHAR_LIMITS.role) newErrors.role = `Exceeds max ${CHAR_LIMITS.role} chars`;
    if (context.length > CHAR_LIMITS.context) newErrors.context = `Exceeds max ${CHAR_LIMITS.context} chars`;
    if (task.length > CHAR_LIMITS.task) newErrors.task = `Exceeds max ${CHAR_LIMITS.task} chars`;
    if (outputFormat.length > CHAR_LIMITS.outputFormat) newErrors.outputFormat = `Exceeds max ${CHAR_LIMITS.outputFormat} chars`;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        role: escapeXml(role.trim()),
        context: escapeXml(context.trim()),
        task: escapeXml(task.trim()),
        outputFormat: escapeXml(outputFormat.trim()),
      });
    } else {
      toast.error("Please fix highlighted form errors.");
    }
  };

  const renderCharCounter = (current, limit) => {
    const isNear = current > limit * 0.85;
    const isOver = current > limit;
    return (
      <span
        className={`text-[10px] font-mono ${
          isOver
            ? "text-red-400 font-bold"
            : isNear
            ? "text-amber-400"
            : "text-zinc-500"
        }`}
      >
        {current.toLocaleString()} / {limit.toLocaleString()}
      </span>
    );
  };

  return (
    <Card className="w-full max-w-2xl mx-auto my-6 shadow-lg border-zinc-800 bg-zinc-950">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <div>
          <CardTitle className="text-2xl font-bold flex items-center gap-2">
            🎯 Define Your Prompt
          </CardTitle>
          <p className="text-xs text-muted-foreground mt-1">
            Engineered meta-prompt parameters. Supports live client-side input limits.
          </p>
        </div>

        {onOpenTemplates && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTemplates}
            className="text-xs border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/10 flex items-center gap-1.5"
          >
            <span>📚 Templates</span>
          </Button>
        )}
      </CardHeader>

      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Target Role */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-zinc-300" htmlFor="pf-role">
                1. Target Persona / Role
              </label>
              {renderCharCounter(role.length, CHAR_LIMITS.role)}
            </div>
            <Input
              id="pf-role"
              placeholder='e.g. "Senior Python Architect"'
              value={role}
              maxLength={CHAR_LIMITS.role}
              onChange={(e) => setRole(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs"
            />
            {errors.role && <p className="text-xs text-red-400 mt-1">{errors.role}</p>}
          </div>

          {/* Context / Background */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-zinc-300" htmlFor="pf-context">
                2. Context / Background
              </label>
              {renderCharCounter(context.length, CHAR_LIMITS.context)}
            </div>
            <Textarea
              id="pf-context"
              placeholder='e.g. "Building an e-commerce microservice with PostgreSQL"'
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-700 text-xs"
            />
            {errors.context && <p className="text-xs text-red-400 mt-1">{errors.context}</p>}
          </div>

          {/* Core Task */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-zinc-300" htmlFor="pf-task">
                3. Core Task / Basic Prompt
              </label>
              {renderCharCounter(task.length, CHAR_LIMITS.task)}
            </div>
            <Textarea
              id="pf-task"
              placeholder='e.g. "Write an auth endpoint with JWT tokens"'
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
              className="bg-zinc-900 border-zinc-700 text-xs"
            />
            {errors.task && <p className="text-xs text-red-400 mt-1">{errors.task}</p>}
          </div>

          {/* Output Format */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block text-xs font-semibold text-zinc-300" htmlFor="pf-output">
                4. Desired Output Format
              </label>
              {renderCharCounter(outputFormat.length, CHAR_LIMITS.outputFormat)}
            </div>
            <Input
              id="pf-output"
              placeholder='e.g. "FastAPI code with Pydantic models"'
              value={outputFormat}
              maxLength={CHAR_LIMITS.outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs"
            />
            {errors.outputFormat && <p className="text-xs text-red-400 mt-1">{errors.outputFormat}</p>}
          </div>

          <div className="pt-1 flex flex-col items-center gap-2">
            <Button type="submit" className="w-full h-11 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 text-white">
              ⚡ Generate Engineered Prompt
            </Button>
            <span className="text-[10px] text-zinc-500 font-mono">
              Pro-tip: Press <kbd className="px-1 py-0.5 rounded bg-zinc-800 text-zinc-300">Ctrl + Enter</kbd> to generate instantly
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
