"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import * as THREE from "three";
import type { Hotspot } from "@/types/panorama";
import { sphericalToPosition, worldToScreen } from "@/lib/panorama-utils";
import { cn } from "@/lib/cn";
import type { CameraState } from "./CameraSync";

interface HotspotOverlayProps {
  hotspots: Hotspot[];
  cameraRef: React.MutableRefObject<CameraState | null>;
  onHotspotClick: (hotspot: Hotspot) => void;
  onHotspotHover?: (hotspot: Hotspot | null) => void;
}

export function HotspotOverlay({
  hotspots,
  cameraRef,
  onHotspotClick,
  onHotspotHover,
}: HotspotOverlayProps) {
  const [tick, setTick] = useState(0);

  // 每帧驱动力刷新
  useEffect(() => {
    let active = true;
    const loop = () => {
      if (!active) return;
      setTick((t) => t + 1);
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
    return () => {
      active = false;
    };
  }, []);

  // 预计算热点3D位置（静态）
  const staticData = useMemo(() => {
    return hotspots.map((h) => ({
      hotspot: h,
      worldPos: sphericalToPosition(h.yaw, h.pitch),
    }));
  }, [hotspots]);

  // 每帧重新投影到屏幕
  const screenData = useMemo(() => {
    const cs = cameraRef.current;
    if (!cs) return [];

    const { camera, size } = cs;

    return staticData
      .map(({ hotspot, worldPos }) => {
        const screen = worldToScreen(worldPos, camera, size.width, size.height);

        const cameraDir = new THREE.Vector3();
        camera.getWorldDirection(cameraDir);
        const toHotspot = worldPos.clone().normalize();
        const inFront = toHotspot.dot(cameraDir) < -0.02;

        return {
          hotspot,
          x: screen.x,
          y: screen.y,
          visible: screen.visible && inFront,
          distance: screen.distance,
        };
      })
      .filter((d) => d.visible);
  }, [staticData, cameraRef, tick]);

  return (
    <div className="pointer-events-none absolute inset-0 z-20">
      {screenData.map(({ hotspot, x, y, distance }) => {
        const opacity = Math.max(0.2, Math.min(1, (8 - distance) / 8));

        return (
          <div
            key={hotspot.id}
            className="pointer-events-auto absolute cursor-pointer"
            style={{
              left: x,
              top: y,
              transform: "translate(-50%, -50%)",
              opacity,
            }}
            onClick={() => onHotspotClick(hotspot)}
            onMouseEnter={() => onHotspotHover?.(hotspot)}
            onMouseLeave={() => onHotspotHover?.(null)}
          >
            <div
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-1.5 transition-all duration-200 hover:scale-110",
                hotspot.type === "navigation" &&
                  "border-cyan-400/50 bg-cyan-500/10 text-cyan-400",
                hotspot.type === "info" &&
                  "border-amber-400/50 bg-amber-500/10 text-amber-400",
                hotspot.type === "media" &&
                  "border-purple-400/50 bg-purple-500/10 text-purple-400",
                hotspot.type === "link" &&
                  "border-white/30 bg-white/5 text-white/80"
              )}
            >
              <span className="relative flex h-2.5 w-2.5">
                <span
                  className={cn(
                    "absolute inset-0 animate-ping rounded-full opacity-75",
                    hotspot.type === "navigation" && "bg-cyan-400",
                    hotspot.type === "info" && "bg-amber-400",
                    hotspot.type === "media" && "bg-purple-400",
                    hotspot.type === "link" && "bg-white"
                  )}
                />
                <span
                  className={cn(
                    "relative h-2.5 w-2.5 rounded-full",
                    hotspot.type === "navigation" && "bg-cyan-400",
                    hotspot.type === "info" && "bg-amber-400",
                    hotspot.type === "media" && "bg-purple-400",
                    hotspot.type === "link" && "bg-white"
                  )}
                />
              </span>
              <span className="text-xs font-medium whitespace-nowrap">
                {hotspot.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
