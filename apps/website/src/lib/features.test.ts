import { describe, expect, it } from "vitest";
import { allFeatures } from "./features";

describe("feature availability", () => {
  it("never marks cloud sharing or OCR as available", () => {
    const byId = Object.fromEntries(allFeatures().map((f) => [f.id, f.status]));
    expect(byId.cloud).toBe("planned");
    expect(byId.ocr).toBe("planned");
    expect(byId.scrolling).toBe("planned");
  });

  it("only claims 'editor' for things the browser editor really does", () => {
    const editor = allFeatures().filter((f) => f.status === "editor").map((f) => f.id);
    expect(editor.sort()).toEqual(["arrows", "backdrop", "blur", "counters", "crop", "export", "freehand", "redact", "text"].sort());
  });
});
