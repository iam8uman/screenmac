import { describe, expect, it } from "vitest";
import { getPlan, plans } from "./pricing";

describe("pricing config", () => {
  it("offers a free beta and lists Pro as unavailable", () => {
    expect(plans.map((plan) => plan.id)).toEqual(["free-beta", "pro"]);
    expect(getPlan("free-beta").available).toBe(true);
    expect(getPlan("pro").available).toBe(false);
  });

  it("never gives an unavailable plan a call to action", () => {
    for (const plan of plans) {
      if (!plan.available) {
        expect(plan.cta).toBeNull();
        expect(plan.unavailableNote).toBeTruthy();
      } else {
        expect(plan.cta?.href).toBe("/download");
      }
    }
  });

  it("does not claim a numeric price for a plan that isn't sold", () => {
    expect(getPlan("pro").price).not.toMatch(/\$|\d/);
  });

  it("throws for unknown plans", () => {
    // @ts-expect-error testing a bad id
    expect(() => getPlan("enterprise")).toThrow();
  });
});
