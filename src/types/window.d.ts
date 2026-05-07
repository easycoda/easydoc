import type { HydrationData, HomeHydrationData } from './hydration';

declare global {
  interface Window {
    __HYDRATION_DATA__?: HydrationData | HomeHydrationData;
  }
}

export {};