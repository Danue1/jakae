import { useStore } from "zustand";
import {
  worldviewStore,
  type WorldviewStoreState,
} from "../store/worldviewStore";

export function useWorldviewStore<Selected>(
  selector: (state: WorldviewStoreState) => Selected,
): Selected {
  return useStore(worldviewStore, selector);
}
