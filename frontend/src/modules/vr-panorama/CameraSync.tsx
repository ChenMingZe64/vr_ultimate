"use client";

import { useEffect, useRef } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Canvas 内部组件，将相机状态同步到外部 ref
 * 供 Canvas 外部的 HTML Overlay 读取
 */
export interface CameraState {
  camera: THREE.PerspectiveCamera;
  size: { width: number; height: number };
}

export function CameraSync({
  onSync,
}: {
  onSync: React.MutableRefObject<CameraState | null>;
}) {
  const { camera, size } = useThree();

  useEffect(() => {
    onSync.current = {
      camera: camera as THREE.PerspectiveCamera,
      size: { width: size.width, height: size.height },
    };
  }, [camera, size, onSync]);

  useFrame(() => {
    if (onSync.current) {
      onSync.current.camera = camera as THREE.PerspectiveCamera;
      onSync.current.size = { width: size.width, height: size.height };
    }
  });

  return null;
}
