"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
export function PWAManager() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            logger.debug(
              "Service Worker registered successfully with scope: ",
              { scope: registration.scope }
            );
          })
          .catch((error) => {
            logger.error(error, "Service Worker registration failed");
          });
      });
    }
  }, []);

  return null;
}
