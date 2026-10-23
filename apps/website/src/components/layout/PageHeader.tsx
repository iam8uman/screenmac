import type { ReactNode } from "react";

export function PageHeader({ title, children }: { title: string; children?: ReactNode }) {
  return (
    <header className="px-4 pb-12 pt-16 md:px-6 md:pb-16 md:pt-24">
      <div className="mx-auto max-w-6xl">
        <h1 className="max-w-3xl text-[clamp(2.4rem,5.6vw,4.25rem)] font-semibold leading-[1.0] tracking-[-0.045em] text-ink">
          {title}
        </h1>
        {children ? <div className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">{children}</div> : null}
      </div>
    </header>
  );
}

export function Prose({ children }: { children: ReactNode }) {
  return (
    <div className="px-4 pb-24 md:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl space-y-10 leading-7 text-ink-muted [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-2 [&_h2]:mb-3 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:tracking-[-0.02em] [&_h2]:text-ink [&_li]:mt-2 [&_p+p]:mt-4 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </div>
  );
}
