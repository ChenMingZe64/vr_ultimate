"use client";

import { useState, useCallback, useRef } from "react";
import { Canvas } from "@react-three/fiber";
import { motion, AnimatePresence } from "framer-motion";
import * as THREE from "three";
import { PanoramaSphere, rotateCamera } from "@/components/three/PanoramaSphere";
import { HotspotOverlay } from "./HotspotOverlay";
import { CameraSync, type CameraState } from "./CameraSync";
import { SceneThumbnails } from "./SceneThumbnails";
import { MenuPanel } from "./MenuPanel";
import { Toolbar } from "./Toolbar";
import { useMouseDrag } from "@/hooks/useMouseDrag";
import type { PanoramaScene, Hotspot } from "@/types/panorama";
import { MOCK_SCENES, getSceneById } from "@/lib/mock-scenes";
import { Menu, MapPin } from "lucide-react";

export function PanoramaViewer() {
  const [scenes] = useState<PanoramaScene[]>(MOCK_SCENES);
  const [currentScene, setCurrentScene] = useState<PanoramaScene>(MOCK_SCENES[0]);
  const [isTransitioning, setTransitioning] = useState(false);
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [isHelpOpen, setHelpOpen] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [infoContent, setInfoContent] = useState("");
  const [fov, setFov] = useState(75);
  const [isMuted, setMuted] = useState(true);
  const [hoveredHotspot, setHoveredHotspot] = useState<Hotspot | null>(null);

  const cameraStateRef = useRef<CameraState | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleRotate = useCallback(
    (deltaYaw: number, deltaPitch: number) => {
      const cs = cameraStateRef.current;
      if (!cs || isTransitioning) return;
      rotateCamera(cs.camera, deltaYaw, deltaPitch);
    },
    [isTransitioning]
  );

  const { handlers } = useMouseDrag({ onRotate: handleRotate, sensitivity: 0.3 });

  // 场景切换
  const handleSceneChange = useCallback(
    async (scene: PanoramaScene) => {
      if (scene.id === currentScene.id || isTransitioning) return;

      setTransitioning(true);

      // Zoom in
      setFov(90);
      await new Promise((r) => setTimeout(r, 400));

      // Switch scene
      setCurrentScene(scene);

      // Zoom out
      await new Promise((r) => setTimeout(r, 100));
      setFov(75);
      await new Promise((r) => setTimeout(r, 600));

      setTransitioning(false);
    },
    [currentScene.id, isTransitioning]
  );

  // 热点点击
  const handleHotspotClick = useCallback(
    async (hotspot: Hotspot) => {
      if (hotspot.type === "navigation" && hotspot.targetSceneId) {
        const targetScene = getSceneById(hotspot.targetSceneId);
        if (targetScene) {
          await handleSceneChange(targetScene);
        }
      } else if (hotspot.type === "info" && hotspot.infoContent) {
        setInfoContent(hotspot.infoContent);
        setShowInfo(true);
      }
    },
    [handleSceneChange]
  );

  // 智慧校园服务跳转
  const handleSmartService = useCallback((route: string) => {
    window.location.href = route;
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative h-[100dvh] w-full overflow-hidden bg-[#0A0E27]"
      {...handlers}
      style={{ touchAction: "none" }}
    >
      {/* ===== Three.js 全景画布 ===== */}
      <div className="absolute inset-0">
        <Canvas
          camera={{
            fov: 75,
            near: 0.1,
            far: 200,
            position: [0, 0, 0],
          }}
          dpr={[1, 2]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <PanoramaSphere
            key={currentScene.id}
            textureUrl={currentScene.panoramaUrl}
            initialYaw={currentScene.initialYaw}
            initialPitch={currentScene.initialPitch}
            fov={fov}
          />
          <CameraSync onSync={cameraStateRef} />
        </Canvas>
      </div>

      {/* ===== 热点投影层 ===== */}
      <HotspotOverlay
        key={currentScene.id + "-hotspots"}
        hotspots={currentScene.hotspots}
        cameraRef={cameraStateRef}
        onHotspotClick={handleHotspotClick}
        onHotspotHover={setHoveredHotspot}
      />

      {/* ===== 顶部信息栏 ===== */}
      <div className="pointer-events-none absolute left-0 right-0 top-0 z-30">
        {/* 顶部渐变遮罩 */}
        <div className="h-24 bg-gradient-to-b from-black/70 to-transparent" />

        {/* 内容 */}
        <div className="absolute left-0 right-0 top-0 flex items-center justify-between px-4 py-4 md:px-6 md:py-5">
          <div className="flex items-center gap-3">
            {/* 菜单按钮 */}
            <button
              onClick={() => setMenuOpen(true)}
              className="pointer-events-auto rounded-xl bg-black/40 p-2.5 text-white/80 backdrop-blur-lg transition-all hover:bg-white/10 hover:text-white ring-1 ring-white/10"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* 场景名称 + 描述 */}
            <div className="hidden sm:block">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-cyan-400" />
                <h1 className="text-lg font-bold text-white">
                  {currentScene.name}
                </h1>
              </div>
              <p className="mt-0.5 max-w-md text-xs text-white/40 truncate">
                {currentScene.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 移动端场景名称 */}
            <div className="sm:hidden text-center">
              <p className="text-sm font-bold text-white">{currentScene.name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ===== 底部渐变 ===== */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 z-20 h-40 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

      {/* ===== 场景缩略图条 ===== */}
      <SceneThumbnails
        scenes={scenes}
        currentSceneId={currentScene.id}
        onSelect={handleSceneChange}
      />

      {/* ===== 工具栏 ===== */}
      <Toolbar
        isMuted={isMuted}
        onToggleMute={() => setMuted(!isMuted)}
        onToggleHelp={() => setHelpOpen(!isHelpOpen)}
        hasGyroscope={false}
        gyroEnabled={false}
        onToggleGyro={() => {}}
      />

      {/* ===== 侧边菜单面板 ===== */}
      <MenuPanel
        isOpen={isMenuOpen}
        onClose={() => setMenuOpen(false)}
        scenes={scenes}
        currentSceneId={currentScene.id}
        onSceneSelect={handleSceneChange}
        onSmartService={handleSmartService}
      />

      {/* ===== 场景切换过渡 ===== */}
      <AnimatePresence>
        {isTransitioning && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="pointer-events-none absolute inset-0 z-50 bg-black/50 backdrop-blur-sm"
          >
            <div className="flex h-full items-center justify-center">
              <div className="flex flex-col items-center gap-4">
                <div className="loading-ring" />
                <p className="text-sm text-white/60">加载场景中...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 信息弹窗 ===== */}
      <AnimatePresence>
        {showInfo && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setShowInfo(false)}
            />
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 30, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="absolute inset-x-4 bottom-36 z-50 mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#0D1B3E]/95 p-6 backdrop-blur-xl shadow-2xl md:inset-x-auto md:left-1/2 md:right-auto md:w-full md:-translate-x-1/2"
            >
              <button
                onClick={() => setShowInfo(false)}
                className="absolute right-4 top-4 rounded-lg p-1 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                ✕
              </button>
              <div
                className="prose prose-invert prose-sm max-w-none mt-2"
                dangerouslySetInnerHTML={{
                  __html: infoContent.replace(/\n/g, "<br/>").replace(/## (.*)/g, "<h2>$1</h2>").replace(/- (.*)/g, "• $1"),
                }}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== 悬浮热点提示 ===== */}
      <AnimatePresence>
        {hoveredHotspot && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="pointer-events-none absolute left-1/2 top-24 z-30 -translate-x-1/2 rounded-full bg-black/80 px-4 py-2 text-sm text-white/80 backdrop-blur-lg ring-1 ring-white/10"
          >
            {hoveredHotspot.tooltip}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== 操作帮助弹窗 ===== */}
      <AnimatePresence>
        {isHelpOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm"
              onClick={() => setHelpOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute inset-4 z-50 mx-auto mt-20 max-w-sm self-start rounded-2xl border border-white/10 bg-[#0D1B3E]/95 p-6 backdrop-blur-xl md:right-6 md:ml-auto"
            >
              <h3 className="mb-4 text-lg font-bold text-white">操作帮助</h3>
              <div className="space-y-3 text-sm text-white/60">
                <p>🖱️ <b className="text-white/80">拖动鼠标</b> — 旋转视角</p>
                <p>📱 <b className="text-white/80">滑动屏幕</b> — 旋转视角（移动端）</p>
                <p>👆 <b className="text-white/80">点击热点</b> — 跳转场景/查看信息</p>
                <p>📋 <b className="text-white/80">底部缩略图</b> — 快速切换场景</p>
                <p>📱 <b className="text-white/80">陀螺仪</b> — 手机移动旋转视角</p>
              </div>
              <button
                onClick={() => setHelpOpen(false)}
                className="mt-4 w-full rounded-xl bg-white/10 py-2 text-sm text-white/80 transition-colors hover:bg-white/20"
              >
                知道了
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
