import type { Viewport } from "next";
import { tokens } from "@screenmac/design-tokens";
import { Comparison } from "@/components/landing/Comparison";
import { FAQ } from "@/components/landing/FAQ";
import { FeaturesSection } from "@/components/landing/Features";
import { FinalCTA } from "@/components/landing/FinalCTA";
import { Install } from "@/components/install/Install";
import { Hero } from "@/components/landing/Hero";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PricingSection } from "@/components/landing/PricingSection";
import { Privacy } from "@/components/landing/Privacy";
import { Showcase } from "@/components/landing/Showcase";

// The landing page opens on the dark night stage, so the browser chrome should match it.
export const viewport: Viewport = { themeColor: tokens.color.night };

export default function HomePage() {
  return (
    <>
      {/* Night stage: headline, the live editor, then how to install it. The header turns dark over it. */}
      <div className="sm-night" data-header-dark="">
        <Hero />
        <Showcase />
        <Install />
      </div>
      <HowItWorks />
      <FeaturesSection />
      <Privacy />
      <Comparison />
      <PricingSection />
      <FAQ />
      <FinalCTA />
    </>
  );
}
