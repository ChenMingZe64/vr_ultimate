"use client";

import { useRef, useCallback } from "react";

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  yaw: number;
  pitch: number;
}

interface UseMouseDragOptions {
  onRotate: (deltaYaw: number, deltaPitch: number) => void;
  sensitivity?: number;
}

export function useMouseDrag({ onRotate, sensitivity = 0.3 }: UseMouseDragOptions) {
  const state = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    yaw: 0,
    pitch: 0,
  });

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    state.current.isDragging = true;
    state.current.startX = e.clientX;
    state.current.startY = e.clientY;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!state.current.isDragging) return;
      const dx = e.clientX - state.current.startX;
      const dy = e.clientY - state.current.startY;
      state.current.startX = e.clientX;
      state.current.startY = e.clientY;

      onRotate(-dx * sensitivity, dy * sensitivity);
    },
    [onRotate, sensitivity]
  );

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    state.current.isDragging = false;
    (e.target as HTMLElement).releasePointerCapture(e.pointerId);
  }, []);

  return {
    handlers: {
      onPointerDown: handlePointerDown,
      onPointerMove: handlePointerMove,
      onPointerUp: handlePointerUp,
      onPointerCancel: handlePointerUp,
    },
  };
}
