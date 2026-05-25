"use client";

import dynamic from "next/dynamic";
import { LoadingScreen } from "@/components/ui/LoadingScreen";

const PanoramaViewer = dynamic(
  () =>
    import("@/modules/vr-panorama/PanoramaViewer").then(
      (mod) => mod.PanoramaViewer
    ),
  {
    ssr: false,
    loading: () => <LoadingScreen />,
  }
);

export default function HomePage() {
  return <PanoramaViewer />;
}
