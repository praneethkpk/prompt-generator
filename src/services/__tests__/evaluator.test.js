import { describe, it, expect } from "vitest";
import { evaluatePrompt } from "../evaluatorService.js";

describe("Prompt Quality Evaluator Engine", () => {
  it("should return null if prompt is empty or null", () => {
    expect(evaluatePrompt(null)).toBeNull();
    expect(evaluatePrompt("")).toBeNull();
  });

  it("should evaluate a structured prompt across 5 metrics", () => {
    const promptText = `
You are a Senior Java Architect. 
Your objective is to design a high-throughput Spring Boot 3 REST API.
Constraints: Do not use third-party libraries; strictly follow SOLID principles.
Output Format: Structured Markdown with code blocks and DTO schemas.
`;
    const inputs = {
      role: "Senior Java Architect",
      context: "Building enterprise Spring Boot 3 app",
      task: "Design REST API",
      outputFormat: "Markdown with DTO schemas",
    };

    const res = evaluatePrompt(promptText, inputs);

    expect(res).not.toBeNull();
    expect(res.overall).toBeGreaterThanOrEqual(7.0);
    expect(res.metrics).toHaveLength(5);
    expect(res.suggestions).toBeInstanceOf(Array);

    const metricNames = res.metrics.map((m) => m.name);
    expect(metricNames).toContain("Clarity");
    expect(metricNames).toContain("Specificity");
    expect(metricNames).toContain("Context & Persona");
    expect(metricNames).toContain("Constraints");
    expect(metricNames).toContain("Output Format");
  });
});
