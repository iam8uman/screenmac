import { describe, expect, it } from "vitest";
import { TOOLS, toolForKey, toolInfo } from "./tools";

describe("tool registry", () => {
  it("has the fourteen PRD tools with unique shortcuts", () => {
    expect(TOOLS).toHaveLength(14);
    expect(new Set(TOOLS.map((t) => t.key)).size).toBe(14);
  });

  it("maps keys case-insensitively", () => {
    expect(toolForKey("R")).toBe("rectangle");
    expect(toolForKey("d")).toBe("redact");
    expect(toolForKey("z")).toBeNull();
  });

  it("throws for unknown tools", () => {
    // @ts-expect-error bad id on purpose
    expect(() => toolInfo("lasso")).toThrow();
  });
});
