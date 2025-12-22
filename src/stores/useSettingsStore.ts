import { DEFAULT_PADDING } from "@/lib/constants";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SettingsStore {
  defaultPadding: number;
  setDefaultPadding: (defaultPadding: number) => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultPadding: DEFAULT_PADDING,
      setDefaultPadding: (defaultPadding) => set({ defaultPadding }),
    }),
    {
      name: "fixmyhalo-settings",
    },
  ),
);
