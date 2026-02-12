// eslint-disable-next-line @typescript-eslint/no-explicit-any
type GTag = (...args: any[]) => void;

declare global {
  interface Window {
    gtag?: GTag;
  }
}

export const sendGAEvent = (eventName: string, params?: Record<string, string | number | boolean | null | undefined>) => {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", eventName, params);
  }
};
