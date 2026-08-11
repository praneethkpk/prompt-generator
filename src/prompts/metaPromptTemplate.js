// src/prompts/metaPromptTemplate.js
//
// Centralised meta-prompt engineering template.
// Accepts sanitised user inputs and returns a structured system prompt
// using XML tags and Chain-of-Thought (CoT) directives that guide the
// LLM to produce high-quality, production-grade prompts.

/**
 * Build a meta-prompt that instructs the LLM to act as a world-class
 * prompt engineer and transform the user's rough inputs into a
 * polished, structured prompt.
 *
 * @param {{ role: string, context: string, task: string, outputFormat: string }} inputs
 * @returns {string} The full meta-prompt string.
 */
export function buildMetaPrompt({ role, context, task, outputFormat }) {
  return `You are a world-class Prompt Engineer. Your job is to transform the rough user inputs below into a single, highly-optimised system prompt that another LLM can follow to produce outstanding results.

<user_inputs>
  <role>${role}</role>
  <context>${context}</context>
  <task>${task}</task>
  <desired_output_format>${outputFormat}</desired_output_format>
</user_inputs>

<instructions>
Using the user inputs above, generate one polished prompt that includes ALL of the following structural sections wrapped in XML tags:

1. <role> — A detailed persona description derived from the user's role input. Expand it with relevant expertise, tone, and domain knowledge the persona should embody.

2. <context> — Rich background and situational context. Expand the user's context into a clear scenario the LLM can ground its response in.

3. <instructions> — Step-by-step instructions derived from the core task. Break the task into numbered, actionable sub-steps. Use Chain-of-Thought reasoning: ask the LLM to "think step by step", consider edge cases, and validate its own output before finalising.

4. <constraints> — A bullet list of constraints and guardrails:
   - Accuracy and factual correctness.
   - Adherence to best practices for the relevant domain.
   - Security considerations (e.g., no hardcoded secrets, input validation).
   - Performance considerations where applicable.
   - Any implicit constraints you can infer from the task.

5. <output_format> — A precise description of the expected output format, structure, and any formatting rules (code blocks, markdown, JSON schema, etc.), derived from the user's desired output format.

6. <chain_of_thought> — Add a final directive asking the responding LLM to:
   a. Restate the problem in its own words.
   b. Outline its approach before writing code or content.
   c. Self-review the output for errors, omissions, and adherence to all constraints.
</instructions>

<meta_constraints>
- Output ONLY the generated prompt. Do NOT include preamble, commentary, or meta-explanation.
- The generated prompt must be self-contained — a user should be able to copy-paste it directly into any LLM chat and get excellent results.
- Use professional, precise language.
- The prompt should be between 300-800 words.
</meta_constraints>`;
}
