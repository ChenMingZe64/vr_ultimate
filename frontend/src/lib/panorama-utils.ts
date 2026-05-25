import * as THREE from "three";

export const SPHERE_RADIUS = 100;

/** 球坐标（yaw/pitch 角度制）→ 3D 世界坐标 */
export function sphericalToPosition(
  yaw: number,
  pitch: number,
  radius: number = SPHERE_RADIUS
): THREE.Vector3 {
  const phi = THREE.MathUtils.degToRad(90 - pitch);
  const theta = THREE.MathUtils.degToRad(yaw);
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  );
}

/** 3D 世界坐标 → 屏幕像素坐标 */
export function worldToScreen(
  worldPos: THREE.Vector3,
  camera: THREE.PerspectiveCamera,
  containerWidth: number,
  containerHeight: number
): { x: number; y: number; visible: boolean; distance: number } {
  const screenPos = worldPos.clone().project(camera);
  return {
    x: (screenPos.x * 0.5 + 0.5) * containerWidth,
    y: (-screenPos.y * 0.5 + 0.5) * containerHeight,
    visible: screenPos.z < 1,
    distance: worldPos.distanceTo(camera.position),
  };
}

/** 热点是否在相机前方可见 */
export function isHotspotInFront(
  hotspotWorldPos: THREE.Vector3,
  camera: THREE.PerspectiveCamera
): boolean {
  const cameraDir = new THREE.Vector3();
  camera.getWorldDirection(cameraDir);
  const toHotspot = hotspotWorldPos.clone().normalize();
  return toHotspot.dot(cameraDir) < -0.02;
}

/** 计算当前相机的 yaw/pitch（用于同步 UI） */
export function getCameraAngles(camera: THREE.PerspectiveCamera): {
  yaw: number;
  pitch: number;
} {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);

  const yaw = THREE.MathUtils.radToDeg(Math.atan2(-dir.x, -dir.z));
  const pitch = THREE.MathUtils.radToDeg(Math.asin(dir.y));

  return {
    yaw: ((yaw % 360) + 360) % 360,
    pitch,
  };
}

/** 平滑阻尼插值 */
export function damp(a: number, b: number, factor: number, dt: number): number {
  return a + (b - a) * factor * Math.min(dt * 60, 1);
}
