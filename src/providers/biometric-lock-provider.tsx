"use client";

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from "react";
import {
  authenticateBiometric,
  isBiometricAvailable,
  isSessionUnlocked,
  markSessionUnlocked,
  markSessionLocked,
} from "@/lib/biometrics";
import { BiometricLockScreen } from "@/components/auth/biometric-lock-screen";

interface BiometricLockContextType {
  isLocked: boolean;
  lockApp: () => void;
  unlockApp: () => Promise<boolean>;
  isBiometricSupported: boolean;
}

const BiometricLockContext = createContext<BiometricLockContextType>({
  isLocked: false,
  lockApp: () => {},
  unlockApp: async () => false,
  isBiometricSupported: false,
});

export const useBiometricLock = () => useContext(BiometricLockContext);

interface BiometricLockProviderProps {
  children: React.ReactNode;
  enabled: boolean;
  timeoutSeconds: number;
}

export function BiometricLockProvider({
  children,
  enabled,
  timeoutSeconds = 0,
}: BiometricLockProviderProps) {
  const [isLocked, setIsLocked] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isBiometricSupported, setIsBiometricSupported] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const lastHiddenTimeRef = useRef<number | null>(null);

  // Check initial lock state and hardware availability after client mount
  useEffect(() => {
    setIsMounted(true);
    isBiometricAvailable().then(setIsBiometricSupported);

    if (enabled) {
      if (!isSessionUnlocked(timeoutSeconds)) {
        setIsLocked(true);
      } else {
        setIsLocked(false);
      }
    }
  }, [enabled, timeoutSeconds]);

  const lockApp = useCallback(() => {
    if (!enabled) return;
    setIsLocked(true);
    markSessionLocked();
  }, [enabled]);

  const unlockApp = useCallback(async (): Promise<boolean> => {
    setIsAuthenticating(true);
    try {
      const success = await authenticateBiometric();
      if (success) {
        setIsLocked(false);
        markSessionUnlocked();
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  // Update lock state if enabled prop changes
  useEffect(() => {
    if (!enabled) {
      setIsLocked(false);
      markSessionLocked();
    }
  }, [enabled]);

  // Handle visibility change and background timeout
  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        lastHiddenTimeRef.current = Date.now();
      } else if (document.visibilityState === "visible") {
        if (lastHiddenTimeRef.current) {
          const elapsedSeconds = (Date.now() - lastHiddenTimeRef.current) / 1000;
          if (timeoutSeconds === 0 || elapsedSeconds >= timeoutSeconds) {
            setIsLocked(true);
            markSessionLocked();
          }
        } else if (!isSessionUnlocked(timeoutSeconds)) {
          setIsLocked(true);
        }
        lastHiddenTimeRef.current = null;
      }
    };

    const handleFocus = () => {
      if (document.visibilityState === "visible" && !isSessionUnlocked(timeoutSeconds)) {
        setIsLocked(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("focus", handleFocus);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("focus", handleFocus);
    };
  }, [enabled, timeoutSeconds]);

  return (
    <BiometricLockContext.Provider
      value={{
        isLocked,
        lockApp,
        unlockApp,
        isBiometricSupported,
      }}
    >
      {isMounted && enabled && isLocked && (
        <BiometricLockScreen
          onUnlock={unlockApp}
          isAuthenticating={isAuthenticating}
        />
      )}
      {children}
    </BiometricLockContext.Provider>
  );
}
