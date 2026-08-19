"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Wifi, WifiOff } from "lucide-react";
import { useNetworkStatus } from "@/hooks/use-network-status";
import { useDictionary } from "@/i18n/dictionary-provider";
import { logger } from "@/lib/logger";

export function OfflineBanner() {
  const { isOffline } = useNetworkStatus();
  const dict = useDictionary();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      logger.warn("Application network state changed: offline (Data sync paused)");
    } else if (wasOffline.current) {
      setShowReconnected(true);
      logger.info("Application network state restored: online (Data sync resumed)");
      const timer = setTimeout(() => {
        setShowReconnected(false);
        wasOffline.current = false;
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  const isVisible = isOffline || showReconnected;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-6 sm:w-96 z-50 pointer-events-auto"
          style={{ top: "calc(env(safe-area-inset-top, 0px) + 0.75rem)" }}
        >
          {isOffline ? (
            <div className="flex items-start gap-3 p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/40 backdrop-blur-md text-amber-900 dark:text-amber-200 shadow-lg shadow-amber-950/5">
              <div className="p-1.5 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
                <WifiOff className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-amber-950 dark:text-amber-100">
                  {dict.offline.bannerTitle}
                </p>
                <p className="mt-0.5 text-amber-800/90 dark:text-amber-300/80 leading-relaxed">
                  {dict.offline.bannerDescription}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/40 backdrop-blur-md text-emerald-900 dark:text-emerald-200 shadow-lg shadow-emerald-950/5">
              <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shrink-0">
                <Wifi className="w-4 h-4" />
              </div>
              <div className="flex-1 text-xs">
                <p className="font-semibold text-emerald-950 dark:text-emerald-100">
                  {dict.offline.reconnectedTitle}
                </p>
                <p className="text-emerald-800/90 dark:text-emerald-300/80">
                  {dict.offline.reconnectedDescription}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
