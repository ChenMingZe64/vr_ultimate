"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  BookOpen,
  GraduationCap,
  Home,
  Utensils,
  FlaskConical,
  Dumbbell,
  TreePine,
  Calendar,
  ClipboardList,
  CreditCard,
  Wrench,
  DoorOpen,
  Bot,
  X,
} from "lucide-react";
import { cn } from "@/lib/cn";
import type { PanoramaScene } from "@/types/panorama";

interface MenuPanelProps {
  isOpen: boolean;
  onClose: () => void;
  scenes: PanoramaScene[];
  currentSceneId: string;
  onSceneSelect: (scene: PanoramaScene) => void;
  onSmartService: (route: string) => void;
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  entrance: <MapPin className="h-4 w-4" />,
  library: <BookOpen className="h-4 w-4" />,
  teaching: <GraduationCap className="h-4 w-4" />,
  dormitory: <Home className="h-4 w-4" />,
  canteen: <Utensils className="h-4 w-4" />,
  lab: <FlaskConical className="h-4 w-4" />,
  sports: <Dumbbell className="h-4 w-4" />,
  landscape: <TreePine className="h-4 w-4" />,
  office: <MapPin className="h-4 w-4" />,
  other: <MapPin className="h-4 w-4" />,
};

const SMART_SERVICES = [
  { label: "课程表", route: "/smart/schedule", icon: <Calendar className="h-4 w-4" /> },
  { label: "成绩查询", route: "/smart/grades", icon: <ClipboardList className="h-4 w-4" /> },
  { label: "校园卡", route: "/smart/card", icon: <CreditCard className="h-4 w-4" /> },
  { label: "报修申请", route: "/smart/repair", icon: <Wrench className="h-4 w-4" /> },
  { label: "空教室", route: "/smart/classroom", icon: <DoorOpen className="h-4 w-4" /> },
];

export function MenuPanel({
  isOpen,
  onClose,
  scenes,
  currentSceneId,
  onSceneSelect,
  onSmartService,
}: MenuPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* 面板 */}
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed left-0 top-0 z-50 flex h-full w-80 flex-col border-r border-white/10 bg-[#0A0E27]/95 backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-white">校园导览</h2>
                <p className="mt-0.5 text-xs text-white/40">东莞理工学院</p>
              </div>
              <button
                onClick={onClose}
                className="rounded-lg p-2 text-white/40 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* VR 场景列表 */}
            <div className="flex-1 overflow-y-auto px-4 py-4">
              <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-white/30">
                VR 全景场景
              </p>
              <div className="space-y-1">
                {scenes.map((scene) => (
                  <button
                    key={scene.id}
                    onClick={() => {
                      onSceneSelect(scene);
                      onClose();
                    }}
                    className={cn(
                      "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all",
                      scene.id === currentSceneId
                        ? "bg-cyan-500/10 text-cyan-400 ring-1 ring-cyan-400/30"
                        : "text-white/60 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <span className="text-white/50">
                      {CATEGORY_ICONS[scene.category]}
                    </span>
                    <span className="text-sm font-medium">{scene.name}</span>
                    {scene.id === currentSceneId && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* 智慧校园服务 */}
              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-white/30">
                  智慧校园服务
                </p>
                <div className="space-y-1">
                  {SMART_SERVICES.map((svc) => (
                    <button
                      key={svc.route}
                      onClick={() => {
                        onSmartService(svc.route);
                        onClose();
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white"
                    >
                      <span className="text-white/40">{svc.icon}</span>
                      {svc.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* 其他 */}
              <div className="mt-6 border-t border-white/10 pt-6">
                <p className="mb-3 px-2 text-xs font-medium uppercase tracking-wider text-white/30">
                  更多
                </p>
                <button
                  onClick={() => {
                    onSmartService("/ai-assistant");
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 transition-all hover:bg-white/5 hover:text-white"
                >
                  <Bot className="h-4 w-4 text-white/40" />
                  AI 校园助手
                </button>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 px-6 py-4">
              <p className="text-center text-[10px] text-white/20">
                Digital Campus VR Panorama v1.0
              </p>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
