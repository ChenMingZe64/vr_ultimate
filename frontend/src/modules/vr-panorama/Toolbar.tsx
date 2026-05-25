"use client";

import { Maximize, Minimize, HelpCircle, Volume2, VolumeX } from "lucide-react";
import { useFullscreen } from "@/hooks/useFullscreen";

interface ToolbarProps {
  isMuted: boolean;
  onToggleMute: () => void;
  onToggleHelp: () => void;
  hasGyroscope: boolean;
  gyroEnabled: boolean;
  onToggleGyro: () => void;
}

export function Toolbar({
  isMuted,
  onToggleMute,
  onToggleHelp,
}: ToolbarProps) {
  const { isFullscreen, toggle } = useFullscreen();

  return (
    <div className="absolute bottom-28 right-4 z-30 flex flex-col gap-2 md:bottom-32 md:right-6">
      {/* 全屏 */}
      <button
        onClick={toggle}
        className="rounded-xl bg-black/40 p-3 text-white/60 backdrop-blur-lg transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
        title={isFullscreen ? "退出全屏" : "全屏模式"}
      >
        {isFullscreen ? (
          <Minimize className="h-5 w-5" />
        ) : (
          <Maximize className="h-5 w-5" />
        )}
      </button>

      {/* 音频 */}
      <button
        onClick={onToggleMute}
        className="rounded-xl bg-black/40 p-3 text-white/60 backdrop-blur-lg transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
        title={isMuted ? "开启音频" : "静音"}
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5" />
        ) : (
          <Volume2 className="h-5 w-5" />
        )}
      </button>

      {/* 帮助 */}
      <button
        onClick={onToggleHelp}
        className="rounded-xl bg-black/40 p-3 text-white/60 backdrop-blur-lg transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
        title="操作帮助"
      >
        <HelpCircle className="h-5 w-5" />
      </button>
    </div>
  );
}
