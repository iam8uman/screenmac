import { PageHeader } from "@/components/layout/PageHeader";
import { LinkButton } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <PageHeader title="Nothing was captured here.">
      <p>This page doesn&apos;t exist. It may have moved, or the link has a typo.</p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <LinkButton href="/">Go to the home page</LinkButton>
        <LinkButton href="/editor" variant="secondary">
          Open the editor
        </LinkButton>
      </div>
    </PageHeader>
  );
}
