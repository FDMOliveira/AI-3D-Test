import SceneLoader from "@/components/SceneLoader";
import HeroContent from "@/components/HeroContent";
import { getClient } from "@/sanity/lib/client";
import { homePageQuery, navigationQuery } from "@/sanity/lib/queries";
import type { HomePage, Navigation } from "@/sanity/lib/types";

export default async function HomePage() {
  const sanity = getClient();

  const [homePageData, navigationData] = sanity
    ? await Promise.all([
        sanity.fetch<HomePage>(homePageQuery).catch(() => null),
        sanity.fetch<Navigation>(navigationQuery).catch(() => null),
      ])
    : [null, null];

  return (
    <>
      {/* 3D canvas — always fixed behind everything */}
      <div className="canvas-container">
        <SceneLoader />
      </div>

      {/* Scroll experience: creates the 500 vh scroll space + text overlays */}
      <HeroContent
        blocks={homePageData?.scrollBlocks}
        navigation={navigationData}
        scrollIndicatorLabel={homePageData?.scrollIndicatorLabel}
      />
    </>
  );
}
