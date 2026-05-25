"use client";

import { motion } from "framer-motion";

export function LoadingScreen() {
  return (
    <div className="loading-screen">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center gap-6"
      >
        {/* Logo / 图标 */}
        <div className="relative">
          <div className="loading-ring" />
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-purple-600"
            />
          </div>
        </div>

        {/* 文字 */}
        <div className="text-center">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="gradient-text text-2xl font-bold"
          >
            东莞理工学院
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-2 text-sm text-white/40"
          >
            数字校园 VR 全景加载中...
          </motion.p>
        </div>
      </motion.div>
    </div>
  );
}
