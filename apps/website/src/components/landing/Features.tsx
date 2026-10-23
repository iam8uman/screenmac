import { AvailabilityBadge } from "@/components/ui/Badge";
import { AVAILABILITY_DESCRIPTION, FEATURE_GROUPS, type Availability } from "@/lib/features";

export function AvailabilityLegend() {
  return (
    <ul className="flex flex-col gap-2.5 text-sm text-ink-muted">
      {(["editor", "building", "planned"] as Availability[]).map((status) => (
        <li key={status} className="flex flex-col items-start gap-1.5 sm:flex-row sm:items-center sm:gap-3">
          <AvailabilityBadge status={status} />
          <span>{AVAILABILITY_DESCRIPTION[status]}</span>
        </li>
      ))}
    </ul>
  );
}

export function Features({ headingLevel = 2 }: { headingLevel?: 2 | 3 }) {
  const GroupHeading = headingLevel === 2 ? "h3" : "h4";
  return (
    <div className="divide-y divide-line border-y border-line">
      {FEATURE_GROUPS.map((group) => (
        <div key={group.id} className="grid gap-6 py-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12 md:py-12">
          <div className="md:sticky md:top-24 md:self-start">
            <GroupHeading className="text-2xl font-semibold tracking-[-0.025em] text-ink">{group.title}</GroupHeading>
            <p className="mt-2 max-w-sm leading-7 text-ink-muted">{group.summary}</p>
          </div>
          <ul className="divide-y divide-line">
            {group.features.map((feature) => (
              <li key={feature.id} className="flex flex-col items-start gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                <div className="min-w-0">
                  <p className="font-medium text-ink">{feature.name}</p>
                  <p className="mt-1 text-[0.9375rem] leading-6 text-ink-muted">{feature.detail}</p>
                </div>
                <AvailabilityBadge status={feature.status} className="sm:mt-0.5" />
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function FeaturesSection() {
  return (
    <section id="features" aria-labelledby="features-title" className="scroll-mt-20 px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-8 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
          <h2 id="features-title" className="text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
            From shortcut to clipboard, in one place.
          </h2>
          <div className="md:pt-2">
            <p className="max-w-xl text-lg leading-8 text-ink-muted">
              Every capability on this page carries its real status. The editor tools work above, right now. Capture and
              recording live in the native Mac app.
            </p>
            <div className="mt-6">
              <AvailabilityLegend />
            </div>
          </div>
        </div>
        <div className="mt-14">
          <Features />
        </div>
      </div>
    </section>
  );
}
