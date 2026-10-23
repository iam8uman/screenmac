import { Check } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { cn } from "@/lib/cn";
import { plans } from "@/lib/pricing";

export function PricingSection({ as: Heading = "h2" }: { as?: "h1" | "h2" }) {
  return (
    <section id="pricing" aria-labelledby="pricing-title" className="scroll-mt-20 border-t border-line px-4 py-20 md:px-6 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-12">
          <Heading id="pricing-title" className="text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em] text-ink">
            Free while it&apos;s in beta.
          </Heading>
          <p className="max-w-xl text-lg leading-8 text-ink-muted md:pt-2">
            Everything in the beta is free. Pro is shown so the roadmap is visible. It has no price and can&apos;t be
            bought.
          </p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {plans.map((plan) => (
            <article
              key={plan.id}
              aria-labelledby={`plan-${plan.id}`}
              className={cn(
                "flex flex-col rounded-[20px] p-7 md:p-8",
                plan.available
                  ? "bg-stage text-stage-ink shadow-[0_30px_60px_-30px_rgba(23,22,28,0.6)]"
                  : "bg-paper-raised text-ink ring-1 ring-line",
              )}
            >
              <div className="flex items-baseline justify-between gap-4">
                <h3 id={`plan-${plan.id}`} className="text-xl font-semibold tracking-[-0.02em]">
                  {plan.name}
                </h3>
                {!plan.available ? (
                  <span className="rounded-full bg-paper-sunk px-2.5 py-0.5 text-xs font-medium text-ink-muted ring-1 ring-inset ring-line-strong">
                    Not available
                  </span>
                ) : null}
              </div>
              <p className="mt-6 text-5xl font-semibold tracking-[-0.04em]">{plan.price}</p>
              <p className={cn("mt-1 text-sm", plan.available ? "text-stage-ink-muted" : "text-ink-muted")}>{plan.cadence}</p>
              <p className={cn("mt-5 leading-7", plan.available ? "text-stage-ink-muted" : "text-ink-muted")}>{plan.summary}</p>
              <ul className="mt-6 space-y-3 text-[0.9375rem]">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3">
                    <Check className={cn("mt-0.5 size-4 shrink-0", plan.available ? "text-[#a99fff]" : "text-ink-faint")} aria-hidden="true" />
                    {feature}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                {plan.cta ? (
                  <LinkButton href={plan.cta.href} variant="accent" size="lg" className="w-full sm:w-auto">
                    {plan.cta.label}
                  </LinkButton>
                ) : (
                  <p className="text-sm text-ink-muted">{plan.unavailableNote}</p>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
