// src/services/evaluatorService.js
/**
 * Prompt Quality Evaluator & Scoring Engine
 * Analyzes engineered prompts against 5 core prompt engineering metrics:
 * 1. Clarity (0–10)
 * 2. Specificity (0–10)
 * 3. Context & Persona (0–10)
 * 4. Constraints & Safety (0–10)
 * 5. Output Format Definition (0–10)
 */

export function evaluatePrompt(promptText, inputs = {}) {
  if (!promptText || typeof promptText !== "string") {
    return null;
  }

  const text = promptText.trim();
  const lower = text.toLowerCase();

  // 1. Clarity Score
  let clarity = 6.0;
  if (text.length > 100) clarity += 1.5;
  if (text.length > 300) clarity += 1.0;
  if (lower.includes("step-by-step") || lower.includes("clearly") || lower.includes("objective")) clarity += 1.5;
  clarity = Math.min(10, Math.max(1, clarity));

  // 2. Specificity Score
  let specificity = 5.5;
  if (lower.includes("example") || lower.includes("sample") || lower.includes("specific")) specificity += 1.5;
  if (lower.includes("version") || lower.includes("framework") || lower.includes("library") || lower.includes("database")) specificity += 1.5;
  if (/\b(must|ensure|only|do not|never)\b/i.test(text)) specificity += 1.5;
  specificity = Math.min(10, Math.max(1, specificity));

  // 3. Context & Persona Score
  let contextScore = 5.0;
  if (inputs.role || lower.includes("role") || lower.includes("act as") || lower.includes("you are a")) contextScore += 2.5;
  if (inputs.context || lower.includes("background") || lower.includes("context")) contextScore += 2.0;
  if (lower.includes("environment") || lower.includes("architecture")) contextScore += 0.5;
  contextScore = Math.min(10, Math.max(1, contextScore));

  // 4. Constraints Score
  let constraints = 4.5;
  if (lower.includes("do not") || lower.includes("avoid") || lower.includes("strictly") || lower.includes("rule")) constraints += 2.5;
  if (lower.includes("error") || lower.includes("security") || lower.includes("exception")) constraints += 1.5;
  if (lower.includes("limit") || lower.includes("max")) constraints += 1.0;
  constraints = Math.min(10, Math.max(1, constraints));

  // 5. Output Format Score
  let outputFormatScore = 5.0;
  if (inputs.outputFormat || lower.includes("format") || lower.includes("json") || lower.includes("markdown") || lower.includes("code block")) outputFormatScore += 2.5;
  if (lower.includes("table") || lower.includes("bullet") || lower.includes("structure")) outputFormatScore += 1.5;
  if (lower.includes("schema") || lower.includes("dto")) outputFormatScore += 1.0;
  outputFormatScore = Math.min(10, Math.max(1, outputFormatScore));

  // Calculate Weighted Overall Score
  const overall = Number(
    (
      clarity * 0.2 +
      specificity * 0.25 +
      contextScore * 0.2 +
      constraints * 0.15 +
      outputFormatScore * 0.2
    ).toFixed(1)
  );

  // Generate Specific Suggestions
  const suggestions = [];
  if (specificity < 8) {
    suggestions.push("Add concrete examples or edge-case handling rules to boost specificity.");
  }
  if (constraints < 7) {
    suggestions.push("Specify negative constraints (e.g., 'Do not use third-party libraries' or 'Avoid verbose explanations').");
  }
  if (outputFormatScore < 8) {
    suggestions.push("Detail exact output structure (e.g., specify JSON schema keys or code snippet requirements).");
  }
  if (contextScore < 8) {
    suggestions.push("Elaborate on target audience and tech stack environment.");
  }
  if (suggestions.length === 0) {
    suggestions.push("Prompt is exceptionally well-structured and ready for production LLM deployment!");
  }

  return {
    overall,
    metrics: [
      { name: "Clarity", score: Number(clarity.toFixed(1)), desc: "Clear objectives & instructions" },
      { name: "Specificity", score: Number(specificity.toFixed(1)), desc: "Exact requirements & tech specs" },
      { name: "Context & Persona", score: Number(contextScore.toFixed(1)), desc: "Target role & background" },
      { name: "Constraints", score: Number(constraints.toFixed(1)), desc: "Safety rules & negative bounds" },
      { name: "Output Format", score: Number(outputFormatScore.toFixed(1)), desc: "Defined output structure" },
    ],
    suggestions,
  };
}
