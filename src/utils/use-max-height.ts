import { useWebplusGlobal } from "./use-webplus-global.ts";

export const useMaxHeight = (): number | null => {
  return useWebplusGlobal("maxHeight");
};
