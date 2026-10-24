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
import { HomeStructuredData } from "@/components/seo/StructuredData";


export default function HomePage() {
  return (
    <>
      <HomeStructuredData />
      <Hero />
      <Showcase />
      <Install />
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
