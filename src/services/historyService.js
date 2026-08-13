// src/services/historyService.js
/**
 * Local Storage Prompt History & Version Service
 */

const STORAGE_KEY = "prompt_gen_history_v1";

export function getPromptHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function savePromptToHistory(promptItem) {
  const history = getPromptHistory();
  const newItem = {
    id: promptItem.id || `prompt_${Date.now()}`,
    timestamp: new Date().toISOString(),
    inputs: promptItem.inputs || {},
    generatedPrompt: promptItem.generatedPrompt || "",
    model: promptItem.model || "Unknown",
    provider: promptItem.provider || "Unknown",
    favorite: promptItem.favorite || false,
    tags: promptItem.tags || [promptItem.inputs?.role?.split(" ")?.[0] || "Prompt"],
  };

  // Keep latest 50 prompts
  const updated = [newItem, ...history.filter((h) => h.id !== newItem.id)].slice(0, 50);
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error("Failed to save history", err);
  }
  return updated;
}

export function toggleFavoritePrompt(id) {
  const history = getPromptHistory();
  const updated = history.map((item) =>
    item.id === id ? { ...item, favorite: !item.favorite } : item
  );
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function deletePromptFromHistory(id) {
  const history = getPromptHistory();
  const updated = history.filter((item) => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function clearPromptHistory() {
  localStorage.removeItem(STORAGE_KEY);
  return [];
}

/**
 * Export history as JSON
 */
export function exportHistoryJSON() {
  const history = getPromptHistory();
  const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-history-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Export single prompt as Markdown
 */
export function exportPromptMarkdown(promptItem) {
  const mdContent = `# ${promptItem.inputs?.task || "Generated Prompt"}

**Role:** ${promptItem.inputs?.role || "N/A"}  
**Context:** ${promptItem.inputs?.context || "N/A"}  
**Generated via:** ${promptItem.provider || "BYOK"} (${promptItem.model || "LLM"}) on ${new Date(promptItem.timestamp).toLocaleDateString()}

---

## Engineered Prompt

\`\`\`markdown
${promptItem.generatedPrompt}
\`\`\`
`;

  const blob = new Blob([mdContent], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `prompt-${promptItem.id || "export"}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Import JSON history backup
 */
export function importHistoryJSON(jsonString) {
  try {
    const parsed = JSON.parse(jsonString);
    if (!Array.isArray(parsed)) throw new Error("Invalid history JSON format");
    const existing = getPromptHistory();
    const merged = [...parsed, ...existing].reduce((acc, curr) => {
      if (!acc.some((item) => item.id === curr.id)) acc.push(curr);
      return acc;
    }, []);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged.slice(0, 50)));
    return merged;
  } catch (err) {
    throw new Error("Failed to parse prompt history JSON file.");
  }
}
