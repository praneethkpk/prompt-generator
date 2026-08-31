import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Target, BookOpen, Zap } from "lucide-react";

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

    if (role.length > CHAR_LIMITS.role) newErrors.role = `Max ${CHAR_LIMITS.role} chars`;
    if (context.length > CHAR_LIMITS.context) newErrors.context = `Max ${CHAR_LIMITS.context} chars`;
    if (task.length > CHAR_LIMITS.task) newErrors.task = `Max ${CHAR_LIMITS.task} chars`;
    if (outputFormat.length > CHAR_LIMITS.outputFormat) newErrors.outputFormat = `Max ${CHAR_LIMITS.outputFormat} chars`;

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        role: escapeXml(role.trim()),
        context: escapeXml(context.trim()),
        task: escapeXml(task.trim()),
        outputFormat: escapeXml(outputFormat.trim()),
      });
    }
  };

  const renderCharCounter = (current, limit) => {
    const isNear = current > limit * 0.85;
    const isOver = current > limit;
    return (
      <span
        className={`text-[10px] font-mono ${
          isOver
            ? "text-destructive font-bold"
            : isNear
            ? "text-amber-500"
            : "text-muted-foreground"
        }`}
      >
        {current.toLocaleString()} / {limit.toLocaleString()}
      </span>
    );
  };

  return (
    <div className="w-full rounded-xl border bg-card shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Define Your Prompt</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Structured meta-prompt parameters for optimal results.
            </p>
          </div>
        </div>
        {onOpenTemplates && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onOpenTemplates}
            className="text-xs gap-1.5"
          >
            <BookOpen className="h-3.5 w-3.5" />
            Templates
          </Button>
        )}
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-5">
        {/* Target Role */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" htmlFor="pf-role">
              Target Persona / Role
            </label>
            {renderCharCounter(role.length, CHAR_LIMITS.role)}
          </div>
          <Input
            id="pf-role"
            placeholder='e.g. "Senior Python Architect"'
            value={role}
            maxLength={CHAR_LIMITS.role}
            onChange={(e) => setRole(e.target.value)}
            className={errors.role ? "border-destructive" : ""}
          />
          {errors.role && <p className="text-xs text-destructive mt-1">{errors.role}</p>}
        </div>

        {/* Context */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" htmlFor="pf-context">
              Context / Background
            </label>
            {renderCharCounter(context.length, CHAR_LIMITS.context)}
          </div>
          <Textarea
            id="pf-context"
            placeholder='e.g. "Building an e-commerce microservice with PostgreSQL"'
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className={errors.context ? "border-destructive" : ""}
          />
          {errors.context && <p className="text-xs text-destructive mt-1">{errors.context}</p>}
        </div>

        {/* Core Task */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" htmlFor="pf-task">
              Core Task / Basic Prompt
            </label>
            {renderCharCounter(task.length, CHAR_LIMITS.task)}
          </div>
          <Textarea
            id="pf-task"
            placeholder='e.g. "Write an auth endpoint with JWT tokens"'
            value={task}
            onChange={(e) => setTask(e.target.value)}
            rows={3}
            className={errors.task ? "border-destructive" : ""}
          />
          {errors.task && <p className="text-xs text-destructive mt-1">{errors.task}</p>}
        </div>

        {/* Output Format */}
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-sm font-medium" htmlFor="pf-output">
              Desired Output Format
            </label>
            {renderCharCounter(outputFormat.length, CHAR_LIMITS.outputFormat)}
          </div>
          <Input
            id="pf-output"
            placeholder='e.g. "FastAPI code with Pydantic models"'
            value={outputFormat}
            maxLength={CHAR_LIMITS.outputFormat}
            onChange={(e) => setOutputFormat(e.target.value)}
            className={errors.outputFormat ? "border-destructive" : ""}
          />
          {errors.outputFormat && <p className="text-xs text-destructive mt-1">{errors.outputFormat}</p>}
        </div>

        <div className="pt-2 flex flex-col items-center gap-2">
          <Button type="submit" className="w-full h-11 text-sm font-bold gap-2">
            <Zap className="h-4 w-4" />
            Generate Engineered Prompt
          </Button>
          <span className="text-[10px] text-muted-foreground font-mono">
            Press <kbd className="px-1.5 py-0.5 rounded bg-muted text-foreground/70">Ctrl + Enter</kbd> to generate
          </span>
        </div>
      </form>
    </div>
  );
}
