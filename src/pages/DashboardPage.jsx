import React from "react";
import { motion } from "framer-motion";
import { Zap, History, Star, Key, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useHistoryStore } from "@/store/historyStore";
import { useSettingsStore } from "@/store/settingsStore";
import { Button } from "@/components/ui/button";

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 10 },
  show: { opacity: 1, y: 0 },
};

export default function DashboardPage() {
  const navigate = useNavigate();
  const history = useHistoryStore((s) => s.history);
  const favorites = history.filter((h) => h.favorite);
  const apiKey = useSettingsStore((s) => s.apiKey);

  const recentPrompts = history.slice(0, 5);
  const totalPrompts = history.length;

  const stats = [
    { label: "Total Prompts", value: totalPrompts, icon: Zap, color: "text-primary" },
    { label: "Favorites", value: favorites.length, icon: Star, color: "text-amber-500" },
    { label: "API Keys", value: apiKey ? 1 : 0, icon: Key, color: "text-cyan-500" },
  ];

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-8">
      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of your prompt engineering activity.
        </p>
      </motion.div>

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <stat.icon className={`h-8 w-8 ${stat.color} opacity-20`} />
            </div>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold mb-3">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => navigate("/")} className="gap-2">
            <Zap className="h-4 w-4" />
            New Prompt
          </Button>
          <Button variant="outline" onClick={() => navigate("/library")} className="gap-2">
            <History className="h-4 w-4" />
            Browse Library
          </Button>
          {!apiKey && (
            <Button variant="outline" onClick={() => navigate("/api-keys")} className="gap-2 border-amber-500/40 text-amber-600 dark:text-amber-400">
              <Key className="h-4 w-4" />
              Add API Key
            </Button>
          )}
        </div>
      </motion.div>

      {/* Recent Prompts */}
      <motion.div variants={item}>
        <h2 className="text-lg font-semibold mb-3">Recent Prompts</h2>
        {recentPrompts.length === 0 ? (
          <div className="p-8 rounded-xl border border-dashed text-center">
            <Clock className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-sm text-muted-foreground">No prompts generated yet.</p>
            <Button variant="outline" size="sm" onClick={() => navigate("/")} className="mt-3">
              <Zap className="h-4 w-4 mr-1.5" />
              Generate Your First Prompt
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentPrompts.map((item) => (
              <div
                key={item.id}
                className="p-4 rounded-xl border bg-card hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-medium truncate">
                        {item.inputs?.role || "Untitled Prompt"}
                      </p>
                      {item.favorite && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">
                      {item.inputs?.task}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground font-mono">
                      {item.model}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {new Date(item.timestamp).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => navigate("/library")} className="w-full">
              View All History
            </Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
