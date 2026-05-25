"use client";

import { useRef, useEffect } from "react";
import { useThree, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import { SPHERE_RADIUS } from "@/lib/panorama-utils";

interface PanoramaSphereProps {
  textureUrl: string;
  initialYaw: number;
  initialPitch: number;
  fov: number;
}

/**
 * 全景球体渲染器
 * 将 Equirectangular 纹理贴到球体内壁，相机置于球心
 */
export function PanoramaSphere({
  textureUrl,
  initialYaw,
  initialPitch,
  fov,
}: PanoramaSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const { camera } = useThree();

  // 加载全景纹理
  const texture = useLoader(THREE.TextureLoader, textureUrl);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;

  // 设置相机初始朝向
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
    setCameraRotation(cam, initialYaw, initialPitch);
  }, [camera, fov, initialYaw, initialPitch]);

  // 同步 fov 变化（场景切换过渡）
  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera;
    cam.fov = fov;
    cam.updateProjectionMatrix();
  }, [camera, fov]);

  return (
    <mesh ref={meshRef} scale={[-1, 1, 1]}>
      <sphereGeometry args={[SPHERE_RADIUS, 128, 128]} />
      <meshBasicMaterial map={texture} side={THREE.BackSide} />
    </mesh>
  );
}

/** 设置相机朝向指定 yaw/pitch */
export function setCameraRotation(
  camera: THREE.PerspectiveCamera,
  yawDeg: number,
  pitchDeg: number
) {
  const yaw = THREE.MathUtils.degToRad(yawDeg);
  const pitch = THREE.MathUtils.degToRad(pitchDeg);

  const direction = new THREE.Vector3(
    -Math.cos(pitch) * Math.sin(yaw),
    Math.sin(pitch),
    -Math.cos(pitch) * Math.cos(yaw)
  );

  camera.lookAt(direction);
}

/** 旋转相机（相对增量） */
export function rotateCamera(
  camera: THREE.PerspectiveCamera,
  deltaYawDeg: number,
  deltaPitchDeg: number
) {
  const euler = new THREE.Euler(
    THREE.MathUtils.degToRad(deltaPitchDeg),
    THREE.MathUtils.degToRad(deltaYawDeg),
    0,
    "YXZ"
  );

  const direction = new THREE.Vector3();
  camera.getWorldDirection(direction);

  direction.applyEuler(euler);
  direction.normalize();

  // 限制俯仰角 (-80° ~ 80°)
  const currentPitch = Math.asin(direction.y);
  const maxPitch = THREE.MathUtils.degToRad(80);
  if (Math.abs(currentPitch) > maxPitch) {
    direction.y = Math.sign(currentPitch) * Math.sin(maxPitch);
    const horizScale =
      Math.cos(maxPitch) / Math.sqrt(direction.x ** 2 + direction.z ** 2);
    direction.x *= horizScale;
    direction.z *= horizScale;
  }

  camera.lookAt(
    camera.position.x + direction.x,
    camera.position.y + direction.y,
    camera.position.z + direction.z
  );
}
