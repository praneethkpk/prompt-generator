import React, { useState, useEffect } from "react";
import Modal, { ModalHeader, ModalTitle, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useHistoryStore } from "@/store/historyStore";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { toast } from "react-hot-toast";
import { History, Search, Star, Copy, Download, RefreshCw, Trash2 } from "lucide-react";

export default function PromptHistoryModal({ isOpen, onClose, onRestorePrompt }) {
  const history = useHistoryStore((s) => s.history);
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite);
  const deleteFromHistory = useHistoryStore((s) => s.deleteFromHistory);
  const clearHistory = useHistoryStore((s) => s.clearHistory);
  const [search, setSearch] = useState("");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  useEffect(() => {
    if (isOpen) setSearch("");
  }, [isOpen]);

  const filteredHistory = history.filter((item) => {
    const matchesFav = !onlyFavorites || item.favorite;
    const matchesSearch =
      (item.inputs?.role || "").toLowerCase().includes(search.toLowerCase()) ||
      (item.inputs?.task || "").toLowerCase().includes(search.toLowerCase());
    return matchesFav && matchesSearch;
  });

  const handleExportMd = (item) => {
    const md = `# ${item.inputs?.task || "Generated Prompt"}\n\n**Role:** ${item.inputs?.role || "N/A"}\n**Model:** ${item.model}\n**Date:** ${new Date(item.timestamp).toLocaleDateString()}\n\n---\n\n${item.generatedPrompt}`;
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `prompt-${item.id}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Exported as Markdown!");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <History className="h-5 w-5 text-primary" />
          <ModalTitle>Prompt History</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent className="space-y-4">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search history..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <button
            onClick={() => setOnlyFavorites(!onlyFavorites)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors whitespace-nowrap ${
              onlyFavorites ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400" : "text-muted-foreground border-border"
            }`}
          >
            <Star className="h-3.5 w-3.5 inline mr-1" /> Favorites
          </button>
        </div>

        {/* History List */}
        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredHistory.map((item) => (
            <div key={item.id} className="p-4 rounded-lg bg-muted space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm truncate">{item.inputs?.role || "Untitled"}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-background border font-mono">{item.model}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{item.inputs?.task}</p>
                </div>
                <button onClick={() => toggleFavorite(item.id)} className={`transition-colors ${item.favorite ? "text-amber-500" : "text-muted-foreground/40 hover:text-amber-500"}`}>
                  <Star className={`h-4 w-4 ${item.favorite ? "fill-amber-500" : ""}`} />
                </button>
              </div>
              <div className="p-2.5 rounded bg-background text-xs font-mono text-muted-foreground max-h-20 overflow-y-auto border">
                {item.generatedPrompt}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{new Date(item.timestamp).toLocaleString()}</span>
                <div className="flex items-center gap-1">
                  <CopyToClipboard text={item.generatedPrompt} onCopy={() => toast.success("Copied!")}>
                    <button className="p-1.5 rounded hover:bg-background"><Copy className="h-3.5 w-3.5" /></button>
                  </CopyToClipboard>
                  <button onClick={() => handleExportMd(item)} className="p-1.5 rounded hover:bg-background"><Download className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { onRestorePrompt(item); toast.success("Restored!"); onClose(); }} className="p-1.5 rounded bg-primary/10 text-primary hover:bg-primary/20"><RefreshCw className="h-3.5 w-3.5" /></button>
                  <button onClick={() => { deleteFromHistory(item.id); toast.success("Deleted"); }} className="p-1.5 rounded hover:bg-destructive/10 text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                </div>
              </div>
            </div>
          ))}
          {filteredHistory.length === 0 && (
            <div className="py-8 text-center text-muted-foreground text-sm">No history items found.</div>
          )}
        </div>

        {history.length > 0 && (
          <div className="flex justify-between items-center pt-2 border-t border-border">
            <Button variant="ghost" size="sm" onClick={() => { clearHistory(); toast.success("Cleared"); }} className="text-destructive hover:text-destructive text-xs">
              <Trash2 className="h-3.5 w-3.5 mr-1" /> Clear All
            </Button>
            <span className="text-xs text-muted-foreground">{history.length} items</span>
          </div>
        )}
      </ModalContent>
    </Modal>
  );
}
