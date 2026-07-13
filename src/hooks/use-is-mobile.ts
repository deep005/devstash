"use client";

import * as React from "react";

/** Viewport width (px) below which the sidebar behaves as a mobile drawer. */
const MOBILE_BREAKPOINT = 768;

/**
 * Tracks whether the viewport is below the mobile breakpoint (Tailwind `md`).
 * Returns `false` during SSR / first paint, then corrects on mount.
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return isMobile;
}
