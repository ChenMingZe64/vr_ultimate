"use client";

import { useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";
import type { PanoramaScene } from "@/types/panorama";

interface SceneThumbnailsProps {
  scenes: PanoramaScene[];
  currentSceneId: string;
  onSelect: (scene: PanoramaScene) => void;
}

const CATEGORY_LABELS: Record<string, string> = {
  entrance: "入口",
  library: "图书馆",
  teaching: "教学楼",
  dormitory: "宿舍",
  canteen: "食堂",
  lab: "实验室",
  sports: "体育馆",
  landscape: "校园风景",
  office: "办公区",
  other: "其他",
};

export function SceneThumbnails({
  scenes,
  currentSceneId,
  onSelect,
}: SceneThumbnailsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // 自动滚动到当前场景
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const scrollLeft =
        el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentSceneId]);

  return (
    <div className="absolute bottom-6 left-0 right-0 z-30 mx-auto max-w-[90vw]">
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto px-4 pb-2 scrollbar-hide"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {scenes.map((scene) => {
          const isActive = scene.id === currentSceneId;
          return (
            <motion.button
              key={scene.id}
              ref={isActive ? activeRef : null}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onSelect(scene)}
              className={cn(
                "group flex shrink-0 flex-col items-center gap-2 rounded-xl p-3 transition-all duration-300",
                "min-w-[100px] backdrop-blur-xl",
                isActive
                  ? "bg-white/10 shadow-lg ring-1 ring-cyan-400/50 glow-cyan"
                  : "bg-black/40 hover:bg-white/5 ring-1 ring-white/10"
              )}
            >
              {/* 缩略图 */}
              <div
                className={cn(
                  "h-14 w-14 overflow-hidden rounded-lg border transition-all duration-300",
                  isActive
                    ? "border-cyan-400/60 shadow-[0_0_15px_rgba(0,229,255,0.2)]"
                    : "border-white/10 group-hover:border-white/20"
                )}
              >
                <img
                  src={scene.thumbnail}
                  alt={scene.name}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>

              {/* 名称 */}
              <span
                className={cn(
                  "text-xs font-medium whitespace-nowrap transition-colors",
                  isActive ? "text-cyan-400" : "text-white/60"
                )}
              >
                {scene.name}
              </span>

              {/* 分类标签 */}
              <span className="text-[10px] text-white/30">
                {CATEGORY_LABELS[scene.category] || scene.category}
              </span>

              {/* 激活指示器 */}
              {isActive && (
                <motion.div
                  layoutId="activeIndicator"
                  className="absolute -bottom-1 left-1/2 h-1 w-8 -translate-x-1/2 rounded-full bg-cyan-400/60"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
