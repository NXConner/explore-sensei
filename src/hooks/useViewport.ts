import { useEffect, useMemo, useState } from "react";

export type ViewportDevice = "mobile" | "tablet" | "desktop" | "ultrawide";

export interface ViewportState {
  width: number;
  height: number;
  orientation: "portrait" | "landscape";
  device: ViewportDevice;
  isTouch: boolean;
  prefersReducedMotion: boolean;
}

const getDeviceFromWidth = (width: number): ViewportDevice => {
  if (width < 768) return "mobile";
  if (width < 1024) return "tablet";
  if (width < 1600) return "desktop";
  return "ultrawide";
};

const getInitialState = (): ViewportState => {
  if (typeof window === "undefined") {
    return {
      width: 1440,
      height: 900,
      orientation: "landscape",
      device: "desktop",
      isTouch: false,
      prefersReducedMotion: false,
    };
  }
  const { innerWidth, innerHeight, matchMedia } = window;
  return {
    width: innerWidth,
    height: innerHeight,
    orientation: innerHeight >= innerWidth ? "portrait" : "landscape",
    device: getDeviceFromWidth(innerWidth),
    isTouch: "ontouchstart" in window || navigator.maxTouchPoints > 1,
    prefersReducedMotion: matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false,
  };
};

export const useViewport = (): ViewportState => {
  const [state, setState] = useState<ViewportState>(() => getInitialState());

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    let frame = 0;
    const resizeHandler = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        setState((prev) => {
          const nextWidth = window.innerWidth;
          const nextHeight = window.innerHeight;
          const prefersReducedMotion =
            window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? prev.prefersReducedMotion;
          const device = getDeviceFromWidth(nextWidth);
          const orientation = nextHeight >= nextWidth ? "portrait" : "landscape";
          const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 1;

          if (
            prev.width === nextWidth &&
            prev.height === nextHeight &&
            prev.device === device &&
            prev.orientation === orientation &&
            prev.prefersReducedMotion === prefersReducedMotion &&
            prev.isTouch === isTouch
          ) {
            return prev;
          }

          return {
            width: nextWidth,
            height: nextHeight,
            device,
            orientation,
            prefersReducedMotion,
            isTouch,
          };
        });
      });
    };

    const reducedMotionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    reducedMotionQuery?.addEventListener("change", resizeHandler);
    window.addEventListener("resize", resizeHandler, { passive: true });
    window.addEventListener("orientationchange", resizeHandler, { passive: true });

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", resizeHandler);
      window.removeEventListener("orientationchange", resizeHandler);
      reducedMotionQuery?.removeEventListener("change", resizeHandler);
    };
  }, []);

  return useMemo(() => state, [state]);
};
