import { describe, expect, it } from "vitest";
import { waitlistSchema } from "./waitlist";

describe("waitlistSchema", () => {
  it("accepts a normal email", () => {
    expect(waitlistSchema.parse({ email: "dev@screenmac.app" }).email).toBe("dev@screenmac.app");
  });

  it("rejects empty and invalid values", () => {
    expect(waitlistSchema.safeParse({ email: "" }).success).toBe(false);
    expect(waitlistSchema.safeParse({ email: "not-an-email" }).success).toBe(false);
  });
});
