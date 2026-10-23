// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { WaitlistForm } from "./WaitlistForm";

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});

describe("WaitlistForm", () => {
  it("rejects an invalid email without calling the server", async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm id="t" />);
    await userEvent.type(screen.getByLabelText("Email address"), "nope");
    await userEvent.click(screen.getByRole("button", { name: "Join the beta list" }));
    expect(screen.getByRole("status")).toHaveTextContent("Enter a valid email address.");
    expect(screen.getByLabelText("Email address")).toHaveAttribute("aria-invalid", "true");
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("shows the server's failure instead of claiming success", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ ok: false, code: "waitlist_unavailable", message: "Beta signup is not configured." }), { status: 503 }),
      ),
    );
    render(<WaitlistForm id="t" />);
    await userEvent.type(screen.getByLabelText("Email address"), "dev@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Join the beta list" }));
    expect(await screen.findByText("Beta signup is not configured.")).toBeInTheDocument();
    expect(screen.queryByText(/You're on the list/)).not.toBeInTheDocument();
  });

  it("confirms only after the server accepts", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);
    render(<WaitlistForm id="t" />);
    await userEvent.type(screen.getByLabelText("Email address"), " dev@example.com ");
    await userEvent.click(screen.getByRole("button", { name: "Join the beta list" }));
    expect(await screen.findByText(/You're on the list/)).toBeInTheDocument();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ email: "dev@example.com" });
    expect(screen.getByLabelText("Email address")).toHaveValue("");
  });

  it("reports a network failure", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));
    render(<WaitlistForm id="t" />);
    await userEvent.type(screen.getByLabelText("Email address"), "dev@example.com");
    await userEvent.click(screen.getByRole("button", { name: "Join the beta list" }));
    expect(await screen.findByText(/didn't reach the server/)).toBeInTheDocument();
  });
});
