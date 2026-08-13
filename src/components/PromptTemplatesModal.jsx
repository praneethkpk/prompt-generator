// src/components/PromptTemplatesModal.jsx
import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROMPT_TEMPLATES } from "@/data/promptTemplates";
import { toast } from "react-hot-toast";

export default function PromptTemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  if (!isOpen) return null;

  const categories = ["All", ...new Set(PROMPT_TEMPLATES.map((t) => t.category))];

  const filteredTemplates = PROMPT_TEMPLATES.filter((template) => {
    const matchesCategory = selectedCategory === "All" || template.category === selectedCategory;
    const matchesSearch =
      template.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.role.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleApply = (template) => {
    onSelectTemplate({
      role: template.role,
      context: template.context,
      task: template.task,
      outputFormat: template.outputFormat,
    });
    toast.success(`Loaded template: ${template.title}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <Card className="w-full max-w-3xl shadow-2xl border-zinc-700 bg-zinc-950 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-zinc-800 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              📚 Prompt Templates Library
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Select a pre-engineered prompt template to auto-fill the form.
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-xl font-bold p-1 rounded-md hover:bg-zinc-800"
            aria-label="Close templates modal"
          >
            ✕
          </button>
        </CardHeader>

        <CardContent className="pt-4 space-y-4">
          {/* Search & Category Filter */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Input
              type="text"
              placeholder="🔍 Search templates by keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-xs flex-1"
            />
            <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`text-xs px-2.5 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                    selectedCategory === cat
                      ? "bg-emerald-600 text-white font-medium"
                      : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 transition-all space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-sm text-zinc-100">{template.title}</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1">
                    {template.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-zinc-500 truncate max-w-[180px]">
                    Role: {template.role}
                  </span>
                  <Button
                    size="sm"
                    onClick={() => handleApply(template)}
                    className="h-7 text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3"
                  >
                    ⚡ Use Template
                  </Button>
                </div>
              </div>
            ))}

            {filteredTemplates.length === 0 && (
              <div className="col-span-full py-12 text-center text-zinc-500 text-xs">
                No matching prompt templates found. Try resetting your search filter.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
