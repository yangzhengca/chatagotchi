import { useWebplusGlobal } from './use-webplus-global.ts';
import { type DisplayMode } from './types.ts';

export const useDisplayMode = (): DisplayMode | null => {
  return useWebplusGlobal('displayMode');
};
