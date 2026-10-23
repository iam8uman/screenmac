import type { Metadata } from "next";
import { FAQ } from "@/components/landing/FAQ";
import { PricingSection } from "@/components/landing/PricingSection";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Screenmac is free during the Mac beta. Pro has no price yet and isn't for sale.",
};

export default function PricingPage() {
  return (
    <div className="[&>section:first-child]:border-t-0">
      <PricingSection as="h1" />
      <FAQ />
    </div>
  );
}
