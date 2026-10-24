const FACTS = [
  {
    title: "No account to capture",
    body: "Capture, mark up, and save without signing in. There is no server for your screenshots to go to.",
  },
  {
    title: "Redaction that holds",
    body: "Redact, blur, and pixelate rewrite the pixels in the file you export. There's no hidden layer to peel back.",
  },
  {
    title: "Files where you can see them",
    body: "Captures live in a normal folder on your Mac. Delete one and it's gone.",
  },
];

export function Privacy() {
  return (
    <section aria-labelledby="privacy-title" className="border-y border-line bg-paper-sunk px-4 py-20 text-ink md:px-6 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 id="privacy-title" className="text-[clamp(2rem,4.4vw,3.25rem)] font-semibold leading-[1.04] tracking-[-0.04em]">
            What you capture stays on your Mac.
          </h2>
          <p className="mt-5 max-w-md leading-7 text-ink-muted">
            Screenshots are full of things you didn&apos;t mean to share. Screenmac is built so that keeping them private is
            the default, not a setting.
          </p>
        </div>
        <dl className="grid gap-8 sm:grid-cols-3 md:grid-cols-1 md:gap-0 md:divide-y md:divide-line-strong">
          {FACTS.map((fact) => (
            <div key={fact.title} className="md:grid md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] md:gap-8 md:py-6 md:first:pt-1">
              <dt className="font-medium">{fact.title}</dt>
              <dd className="mt-2 leading-7 text-ink-muted md:mt-0">{fact.body}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
