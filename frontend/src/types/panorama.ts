export interface PanoramaScene {
  id: string;
  name: string;
  slug: string;
  category: SceneCategory;
  description: string;
  thumbnail: string;
  panoramaUrl: string;
  lowresUrl?: string;
  initialYaw: number;
  initialPitch: number;
  hotspots: Hotspot[];
  audioGuideUrl?: string;
  geoPosition?: { lat: number; lng: number };
  order: number;
}

export type SceneCategory =
  | "entrance"
  | "library"
  | "teaching"
  | "dormitory"
  | "canteen"
  | "lab"
  | "sports"
  | "landscape"
  | "office"
  | "other";

export interface Hotspot {
  id: string;
  type: "navigation" | "info" | "media" | "link";
  yaw: number;
  pitch: number;
  icon: string;
  label: string;
  tooltip: string;
  targetSceneId?: string;
  infoContent?: string;
  mediaUrl?: string;
  linkUrl?: string;
  animation?: "pulse" | "float" | "rotate";
}

export interface ScreenPosition {
  x: number;
  y: number;
  visible: boolean;
  distance: number;
}
