import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useHistoryStore = create(
  persist(
    (set, get) => ({
      history: [],

      addToHistory: (item) => {
        const newItem = {
          id: item.id || `prompt_${Date.now()}`,
          timestamp: new Date().toISOString(),
          inputs: item.inputs || {},
          generatedPrompt: item.generatedPrompt || "",
          model: item.model || "Unknown",
          provider: item.provider || "Unknown",
          favorite: item.favorite || false,
          tags: item.tags || [item.inputs?.role?.split(" ")?.[0] || "Prompt"],
        };

        set((state) => ({
          history: [newItem, ...state.history.filter((h) => h.id !== newItem.id)].slice(0, 50),
        }));
      },

      toggleFavorite: (id) => {
        set((state) => ({
          history: state.history.map((item) =>
            item.id === id ? { ...item, favorite: !item.favorite } : item
          ),
        }));
      },

      deleteFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      clearHistory: () => {
        set({ history: [] });
      },

      importHistory: (jsonString) => {
        try {
          const parsed = JSON.parse(jsonString);
          if (!Array.isArray(parsed)) throw new Error("Invalid format");
          const existing = get().history;
          const merged = [...parsed, ...existing].reduce((acc, curr) => {
            if (!acc.some((item) => item.id === curr.id)) acc.push(curr);
            return acc;
          }, []);
          set({ history: merged.slice(0, 50) });
          return merged;
        } catch {
          throw new Error("Failed to parse history JSON.");
        }
      },

      getFavorites: () => {
        return get().history.filter((item) => item.favorite);
      },

      getRecent: (count = 5) => {
        return get().history.slice(0, count);
      },
    }),
    {
      name: "prompt_gen_history_v2",
    }
  )
);
