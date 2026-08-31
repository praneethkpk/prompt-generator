import { create } from "zustand";
import { persist } from "zustand/middleware";
import { PROVIDER_PRESETS } from "@/services/adapters";

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      provider: "gemini",
      model: PROVIDER_PRESETS.gemini.models[0],
      baseURL: PROVIDER_PRESETS.gemini.baseURL,
      customEndpointsApproved: [],

      apiKey: "",

      setProvider: (provider) => {
        const preset = PROVIDER_PRESETS[provider];
        if (preset && provider !== "custom") {
          set({
            provider,
            baseURL: preset.baseURL,
            model: preset.models[0] || "",
          });
        } else if (provider === "custom") {
          set({ provider, baseURL: "", model: "" });
        } else {
          set({ provider });
        }
      },

      setModel: (model) => set({ model }),

      setBaseURL: (baseURL) => set({ baseURL }),

      setApiKey: (apiKey) => set({ apiKey }),

      approveCustomEndpoint: (url) => {
        set((state) => ({
          customEndpointsApproved: [...state.customEndpointsApproved, url],
        }));
      },

      activateSettings: (provider, model, baseURL, apiKey) => {
        set({ provider, model, baseURL, apiKey });
      },

      resetDefaults: () => {
        set({
          provider: "gemini",
          model: PROVIDER_PRESETS.gemini.models[0],
          baseURL: PROVIDER_PRESETS.gemini.baseURL,
          apiKey: "",
          customEndpointsApproved: [],
        });
      },

      getActivePreset: () => {
        const { provider } = get();
        return PROVIDER_PRESETS[provider] || PROVIDER_PRESETS.custom;
      },
    }),
    {
      name: "prompt_gen_settings_v3",
      partialize: (state) => ({
        provider: state.provider,
        model: state.model,
        baseURL: state.baseURL,
        customEndpointsApproved: state.customEndpointsApproved,
      }),
    }
  )
);
