import { describe, expect, it, vi } from "vitest";

import { authenticate, type AuthClient } from "@/lib/auth/authenticate";

function createAuthClient(overrides: Partial<AuthClient["auth"]> = {}): AuthClient {
  return {
    auth: {
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "user-1" } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      ...overrides,
    },
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: { id: "user-1" }, error: null }),
        }),
      }),
    }),
  };
}

describe("authenticate", () => {
  it("returns invalid_input for an empty email or password, without calling Supabase", async () => {
    const supabase = createAuthClient();

    const result = await authenticate("", "", supabase);

    expect(result).toEqual({ status: "invalid_input", error: "Enter your email and password." });
    expect(supabase.auth.signInWithPassword).not.toHaveBeenCalled();
  });

  it("returns success for valid credentials with a provisioned profile", async () => {
    const supabase = createAuthClient();

    const result = await authenticate("owner@greennet.example", "correct-password", supabase);

    expect(result).toEqual({ status: "success" });
    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "owner@greennet.example",
      password: "correct-password",
    });
  });

  it("returns invalid_credentials when Supabase rejects the password", async () => {
    const supabase = createAuthClient({
      signInWithPassword: vi.fn().mockResolvedValue({
        data: { user: null },
        error: { message: "Invalid login credentials" },
      }),
    });

    const result = await authenticate("owner@greennet.example", "wrong-password", supabase);

    expect(result).toEqual({ status: "invalid_credentials" });
  });

  it("signs out and returns unauthorized when the account has no profiles row", async () => {
    const supabase = createAuthClient();
    supabase.from = vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({ data: null, error: { message: "not found" } }),
        }),
      }),
    });

    const result = await authenticate("stranger@example.com", "some-password", supabase);

    expect(result).toEqual({ status: "unauthorized" });
    expect(supabase.auth.signOut).toHaveBeenCalledTimes(1);
  });

  it("trims the email before authenticating", async () => {
    const supabase = createAuthClient();

    await authenticate("  owner@greennet.example  ", "correct-password", supabase);

    expect(supabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "owner@greennet.example",
      password: "correct-password",
    });
  });
});
