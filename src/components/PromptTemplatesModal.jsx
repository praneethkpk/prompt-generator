import React, { useState } from "react";
import Modal, { ModalHeader, ModalTitle, ModalContent } from "@/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PROMPT_TEMPLATES } from "@/data/promptTemplates";
import { toast } from "react-hot-toast";
import { BookOpen, Search, Zap } from "lucide-react";

export default function PromptTemplatesModal({ isOpen, onClose, onSelectTemplate }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="max-w-3xl">
      <ModalHeader>
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          <ModalTitle>Prompt Templates</ModalTitle>
        </div>
      </ModalHeader>
      <ModalContent className="space-y-4">
        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`text-xs px-2.5 py-1.5 rounded-full whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[50vh] overflow-y-auto pr-1">
          {filteredTemplates.map((template) => (
            <div
              key={template.id}
              className="p-4 rounded-lg bg-muted hover:bg-accent transition-colors space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                  {template.category}
                </span>
              </div>
              <h3 className="font-semibold text-sm">{template.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{template.description}</p>
              <div className="flex items-center justify-between pt-2 border-t border-border">
                <span className="text-[11px] text-muted-foreground truncate max-w-[180px]">Role: {template.role}</span>
                <Button size="sm" onClick={() => handleApply(template)} className="h-7 text-xs gap-1">
                  <Zap className="h-3 w-3" />
                  Use
                </Button>
              </div>
            </div>
          ))}
          {filteredTemplates.length === 0 && (
            <div className="col-span-full py-8 text-center text-muted-foreground text-sm">
              No matching templates found.
            </div>
          )}
        </div>
      </ModalContent>
    </Modal>
  );
}
