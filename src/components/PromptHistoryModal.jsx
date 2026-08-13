// src/components/PromptHistoryModal.jsx
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  getPromptHistory,
  toggleFavoritePrompt,
  deletePromptFromHistory,
  clearPromptHistory,
  exportHistoryJSON,
  exportPromptMarkdown,
  importHistoryJSON,
} from "@/services/historyService";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-hot-toast";

export default function PromptHistoryModal({ isOpen, onClose, onRestorePrompt }) {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setHistory(getPromptHistory());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFavoriteToggle = (id) => {
    const updated = toggleFavoritePrompt(id);
    setHistory(updated);
  };

  const handleDelete = (id) => {
    const updated = deletePromptFromHistory(id);
    setHistory(updated);
    toast.success("Prompt deleted from history.");
  };

  const handleClearAll = () => {
    if (confirm("Are you sure you want to clear all prompt history?")) {
      setHistory(clearPromptHistory());
      toast.success("History cleared.");
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const merged = importHistoryJSON(event.target.result);
        setHistory(merged);
        toast.success("History imported successfully!");
      } catch (err) {
        toast.error(err.message);
      }
    };
    reader.readAsText(file);
  };

  const filteredHistory = history.filter((item) => {
    const matchesFav = !onlyFavorites || item.favorite;
    const matchesSearch =
      (item.inputs?.role || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.inputs?.task || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.generatedPrompt || "").toLowerCase().includes(search.toLowerCase());
    return matchesFav && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-3xl shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              📜 Prompt History &amp; Favorites
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Locally saved prompts ({history.length} stored). Re-use, export, or search anytime.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-zinc-800"
            aria-label="Close history modal"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <Input
              type="text"
              placeholder="🔍 Search history..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs flex-1"
            />
            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={() => setOnlyFavorites(!onlyFavorites)}
                className={`text-xs px-2.5 py-1.5 rounded border transition-colors ${
                  onlyFavorites
                    ? "bg-amber-500/20 border-amber-500/40 text-amber-300 font-medium"
                    : "bg-zinc-900 border-zinc-800 text-zinc-400"
                }`}
              >
                ★ Favorites Only
              </button>
              <Button
                variant="outline"
                size="sm"
                onClick={exportHistoryJSON}
                className="h-8 text-xs border-zinc-700 text-zinc-300"
              >
                📥 Export JSON
              </Button>
              <label className="cursor-pointer">
                <span className="h-8 text-xs px-3 py-1.5 rounded border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 inline-block">
                  📤 Import
                </span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* History List */}
          <div className="space-y-3 pt-2">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-zinc-700 space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm text-zinc-100">
                        {item.inputs?.role || "Engineered Prompt"}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 font-mono">
                        {item.model}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mt-1 line-clamp-1">
                      {item.inputs?.task}
                    </p>
                  </div>
                  <button
                    onClick={() => handleFavoriteToggle(item.id)}
                    className={`text-lg transition-transform ${
                      item.favorite ? "text-amber-400 scale-110" : "text-zinc-600 hover:text-amber-400"
                    }`}
                  >
                    ★
                  </button>
                </div>

                <div className="p-2.5 rounded bg-zinc-950 text-xs font-mono text-zinc-300 max-h-24 overflow-y-auto border border-zinc-800/80">
                  {item.generatedPrompt}
                </div>

                <div className="flex items-center justify-between text-xs text-zinc-500 pt-1 border-t border-zinc-800/60">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <div className="flex items-center gap-1.5">
                    <CopyToClipboard
                      text={item.generatedPrompt}
                      onCopy={() => toast.success("Copied prompt!")}
                    >
                      <button className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300">
                        📋 Copy
                      </button>
                    </CopyToClipboard>

                    <button
                      onClick={() => exportPromptMarkdown(item)}
                      className="px-2 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                    >
                      📝 Export .md
                    </button>

                    <button
                      onClick={() => {
                        onRestorePrompt(item);
                        toast.success("Restored prompt to editor!");
                        onClose();
                      }}
                      className="px-2 py-1 rounded bg-emerald-600/20 text-emerald-300 hover:bg-emerald-600/30 border border-emerald-500/30 font-medium"
                    >
                      🔄 Restore
                    </button>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="px-2 py-1 rounded hover:bg-red-500/20 text-red-400"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="py-12 text-center text-zinc-500 text-xs">
                No prompt history items found.
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-2 flex justify-between items-center border-t border-zinc-800">
              <button
                onClick={handleClearAll}
                className="text-xs text-red-400 hover:underline"
              >
                Clear Entire History
              </button>
              <Button size="sm" variant="outline" onClick={onClose} className="border-zinc-700">
                Close
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
