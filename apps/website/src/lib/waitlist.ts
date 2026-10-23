import { z } from "zod";

export const waitlistSchema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
});

export type WaitlistInput = z.infer<typeof waitlistSchema>;

export type WaitlistResult =
  | { ok: true }
  | { ok: false; code: "invalid" | "waitlist_unavailable" | "upstream_failed"; message: string };
