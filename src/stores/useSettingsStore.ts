import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  defaultPadding: number;
  setDefaultPadding: (defaultPadding: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultPadding: 16,
      setDefaultPadding: (defaultPadding) => set({ defaultPadding }),
    }),
    {
      name: "fixmyhalo-settings",
    },
  ),
);
