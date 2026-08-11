// src/components/PromptForm.jsx
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { toast } from "react-hot-toast";

/**
 * PromptForm – collects four pieces of user input and validates them.
 * All fields are required. Sanitisation (HTML/XML escape) is performed
 * before forwarding to the parent via onSubmit.
 */
export default function PromptForm({ onSubmit }) {
  const [role, setRole] = useState("");
  const [context, setContext] = useState("");
  const [task, setTask] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [errors, setErrors] = useState({});

  /** Escape XML/HTML special characters to prevent prompt-injection. */
  const escapeXml = (unsafe) =>
    unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&apos;");

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!role.trim()) newErrors.role = "Role is required";
    if (!context.trim()) newErrors.context = "Context is required";
    if (!task.trim()) newErrors.task = "Task is required";
    if (!outputFormat.trim()) newErrors.outputFormat = "Desired output format is required";
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      onSubmit({
        role: escapeXml(role.trim()),
        context: escapeXml(context.trim()),
        task: escapeXml(task.trim()),
        outputFormat: escapeXml(outputFormat.trim()),
      });
    } else {
      toast.error("Please fix the highlighted errors.");
    }
  };

  const fieldClass = (name) =>
    errors[name]
      ? "border-red-500 focus-visible:ring-red-500"
      : "";

  return (
    <Card className="w-full max-w-2xl mx-auto my-8 shadow-lg border-zinc-800">
      <CardHeader>
        <CardTitle className="text-2xl">🎯 Define Your Prompt</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          Fill in each field below. The generator will engineer a production-grade prompt from your inputs.
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Role */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="pf-role">
              Target Persona / Role
            </label>
            <Input
              id="pf-role"
              className={fieldClass("role")}
              placeholder='e.g. "Senior Python Engineer"'
              value={role}
              onChange={(e) => setRole(e.target.value)}
            />
            {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
          </div>

          {/* Context */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="pf-context">
              Context / Background
            </label>
            <Textarea
              id="pf-context"
              className={fieldClass("context")}
              placeholder='e.g. "Building an e-commerce API with PostgreSQL"'
              value={context}
              onChange={(e) => setContext(e.target.value)}
              rows={3}
            />
            {errors.context && <p className="text-xs text-red-500 mt-1">{errors.context}</p>}
          </div>

          {/* Task */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="pf-task">
              Core Task / Basic Prompt
            </label>
            <Textarea
              id="pf-task"
              className={fieldClass("task")}
              placeholder='e.g. "Write an auth endpoint with JWT tokens"'
              value={task}
              onChange={(e) => setTask(e.target.value)}
              rows={3}
            />
            {errors.task && <p className="text-xs text-red-500 mt-1">{errors.task}</p>}
          </div>

          {/* Output Format */}
          <div>
            <label className="block text-sm font-medium mb-1.5" htmlFor="pf-output">
              Desired Output Format
            </label>
            <Input
              id="pf-output"
              className={fieldClass("outputFormat")}
              placeholder='e.g. "FastAPI code with Pydantic models"'
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
            />
            {errors.outputFormat && (
              <p className="text-xs text-red-500 mt-1">{errors.outputFormat}</p>
            )}
          </div>

          <Button type="submit" className="w-full h-11 text-base font-semibold">
            ⚡ Generate Prompt
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
