import React, { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, History, Star, Search, Trash2, Copy, Download, RefreshCw } from "lucide-react";
import { PROMPT_TEMPLATES } from "@/data/promptTemplates";
import { useHistoryStore } from "@/store/historyStore";
import { toast } from "react-hot-toast";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Badge from "@/components/ui/Badge";

const tabs = [
  { id: "templates", label: "Templates", icon: BookOpen },
  { id: "history", label: "History", icon: History },
];

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState("templates");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [onlyFavorites, setOnlyFavorites] = useState(false);

  const history = useHistoryStore((s) => s.history);
  const toggleFavorite = useHistoryStore((s) => s.toggleFavorite);
  const deleteFromHistory = useHistoryStore((s) => s.deleteFromHistory);
  const clearHistory = useHistoryStore((s) => s.clearHistory);

  const categories = ["All", ...new Set(PROMPT_TEMPLATES.map((t) => t.category))];

  const filteredTemplates = PROMPT_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredHistory = history.filter((item) => {
    const matchesFav = !onlyFavorites || item.favorite;
    const matchesSearch =
      (item.inputs?.role || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.inputs?.task || "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFav && matchesSearch;
  });

  const handleExportMarkdown = (item) => {
    const md = `# ${item.inputs?.task || "Generated Prompt"}\n\n**Role:** ${item.inputs?.role || "N/A"}\n**Model:** ${item.model}\n**Date:** ${new Date(item.timestamp).toLocaleDateString()}\n\n---\n\n## Engineered Prompt\n\n${item.generatedPrompt}`;
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Library</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse prompt templates and your generation history.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Templates Tab */}
      {activeTab === "templates" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Category Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTemplates.map((template, idx) => (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="p-5 rounded-xl border bg-card hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <Badge variant="success">{template.category}</Badge>
                </div>
                <h3 className="font-semibold text-sm mb-1">{template.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed mb-3">
                  {template.description}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <span className="text-[11px] text-muted-foreground truncate max-w-[200px]">
                    Role: {template.role}
                  </span>
                  <Button size="sm" className="h-7 text-xs gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Zap className="h-3.5 w-3.5" />
                    Use
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No matching templates found.
            </div>
          )}
        </motion.div>
      )}

      {/* History Tab */}
      {activeTab === "history" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* History Controls */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setOnlyFavorites(!onlyFavorites)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                onlyFavorites
                  ? "bg-amber-500/20 border-amber-500/40 text-amber-600 dark:text-amber-400 font-medium"
                  : "text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              <Star className="h-3.5 w-3.5 inline mr-1" />
              Favorites Only
            </button>
            <span className="text-xs text-muted-foreground">{history.length} items</span>
          </div>

          {/* History List */}
          <div className="space-y-3">
            {filteredHistory.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm truncate">
                        {item.inputs?.role || "Engineered Prompt"}
                      </span>
                      <Badge variant="secondary">{item.model}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                      {item.inputs?.task}
                    </p>
                  </div>
                  <button
                    onClick={() => toggleFavorite(item.id)}
                    className={`transition-colors ${
                      item.favorite
                        ? "text-amber-500"
                        : "text-muted-foreground/40 hover:text-amber-500"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${item.favorite ? "fill-amber-500" : ""}`} />
                  </button>
                </div>

                <div className="p-2.5 rounded-lg bg-muted text-xs font-mono text-muted-foreground max-h-20 overflow-y-auto mb-3">
                  {item.generatedPrompt}
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{new Date(item.timestamp).toLocaleString()}</span>
                  <div className="flex items-center gap-1.5">
                    <CopyToClipboard text={item.generatedPrompt} onCopy={() => toast.success("Copied!")}>
                      <button className="p-1.5 rounded-md hover:bg-muted transition-colors">
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </CopyToClipboard>
                    <button onClick={() => handleExportMarkdown(item)} className="p-1.5 rounded-md hover:bg-muted transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => { deleteFromHistory(item.id); toast.success("Deleted"); }} className="p-1.5 rounded-md hover:bg-destructive/10 text-destructive transition-colors">
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredHistory.length === 0 && (
              <div className="py-12 text-center text-muted-foreground text-sm">
                {history.length === 0 ? "No history yet. Generate your first prompt!" : "No items match your filters."}
              </div>
            )}
          </div>

          {history.length > 0 && (
            <div className="pt-2 flex justify-end">
              <Button variant="ghost" size="sm" onClick={() => { clearHistory(); toast.success("History cleared"); }} className="text-destructive hover:text-destructive">
                <Trash2 className="h-4 w-4 mr-1.5" />
                Clear All History
              </Button>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
