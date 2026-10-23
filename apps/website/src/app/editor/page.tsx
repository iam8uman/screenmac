import type { Metadata } from "next";
import { Editor } from "@/features/editor/ui/Editor";

export const metadata: Metadata = {
  title: "Editor",
  description: "Annotate a screenshot in your browser: arrows, text, steps, blur, redaction, crop, and backgrounds. Export a PNG. Nothing is uploaded.",
};

export default function EditorPage() {
  return (
    <div className="px-2 py-2 sm:px-3 sm:py-3">
      <h1 className="sr-only">Screenmac editor</h1>
      <div className="h-[calc(100dvh-4rem-1rem)] min-h-[560px] overflow-hidden rounded-2xl shadow-[0_0_0_1px_rgba(23,22,28,0.9)] sm:h-[calc(100dvh-4rem-1.5rem)]">
        <Editor variant="full" />
      </div>
    </div>
  );
}
