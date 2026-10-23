// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { TOOLS } from "../tools";
import { Toolbar } from "./Toolbar";

afterEach(cleanup);

describe("Toolbar", () => {
  it("renders every tool as a labelled toggle with its shortcut", () => {
    render(<Toolbar tool="arrow" onToolChange={() => {}} />);
    for (const info of TOOLS) {
      const button = screen.getByRole("button", { name: info.label });
      expect(button).toHaveAttribute("aria-keyshortcuts", info.key.toUpperCase());
      expect(button).toHaveAttribute("aria-pressed", info.id === "arrow" ? "true" : "false");
    }
  });

  it("reports the chosen tool", async () => {
    const onToolChange = vi.fn();
    render(<Toolbar tool="arrow" onToolChange={onToolChange} />);
    await userEvent.click(screen.getByRole("button", { name: "Redact" }));
    expect(onToolChange).toHaveBeenCalledWith("redact");
  });
});
