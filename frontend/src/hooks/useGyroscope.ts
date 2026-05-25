"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import * as THREE from "three";

interface GyroscopeState {
  enabled: boolean;
  permission: "granted" | "denied" | "prompt";
  alpha: number;
  beta: number;
  gamma: number;
}

export function useGyroscope() {
  const [state, setState] = useState<GyroscopeState>({
    enabled: false,
    permission: "prompt",
    alpha: 0,
    beta: 0,
    gamma: 0,
  });

  const initialOrientation = useRef<{ alpha: number; beta: number } | null>(null);

  const requestPermission = useCallback(async () => {
    if (typeof DeviceOrientationEvent === "undefined") return;

    try {
      // iOS 13+ requires explicit permission
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission === "granted") {
          setState((s) => ({ ...s, enabled: true, permission: "granted" }));
        }
      } else {
        setState((s) => ({ ...s, enabled: true, permission: "granted" }));
      }
    } catch {
      setState((s) => ({ ...s, permission: "denied" }));
    }
  }, []);

  useEffect(() => {
    if (!state.enabled) return;

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (!initialOrientation.current) {
        initialOrientation.current = {
          alpha: e.alpha || 0,
          beta: e.beta || 0,
        };
      }

      setState((s) => ({
        ...s,
        alpha: e.alpha || 0,
        beta: e.beta || 0,
        gamma: e.gamma || 0,
      }));
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [state.enabled]);

  const disable = useCallback(() => {
    setState((s) => ({ ...s, enabled: false }));
    initialOrientation.current = null;
  }, []);

  // 返回相对旋转角度
  const rotation = initialOrientation.current
    ? {
        yaw: state.alpha - initialOrientation.current.alpha,
        pitch: state.beta - initialOrientation.current.beta,
      }
    : { yaw: 0, pitch: 0 };

  return { ...state, rotation, requestPermission, disable };
}
