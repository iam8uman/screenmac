import type { Metadata } from "next";
import { AvailabilityLegend, Features } from "@/components/landing/Features";
import { HowItWorks } from "@/components/landing/HowItWorks";
import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Features",
  description: "Every Screenmac capability and its real status: in the browser editor, coming in the Mac app, or planned.",
};

export default function FeaturesPage() {
  return (
    <>
      <PageHeader title="Everything Screenmac does, and what's still coming.">
        <p>Each item carries its real status, so you know what you can try today.</p>
        <div className="mt-6">
          <AvailabilityLegend />
        </div>
        <LinkButton href="/editor" className="mt-8">
          Open the editor
        </LinkButton>
      </PageHeader>
      <div className="px-4 pb-20 md:px-6">
        <div className="mx-auto max-w-6xl">
          <Features headingLevel={2} />
        </div>
      </div>
      <HowItWorks />
    </>
  );
}
