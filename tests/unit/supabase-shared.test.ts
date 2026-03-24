import { afterEach, describe, expect, it, vi } from "vitest";

import { getUserSafely } from "@/lib/supabase/auth";
import {
  SupabaseRequestTimeoutError,
  createSupabaseFetchWithTimeout,
} from "@/lib/supabase/shared";

afterEach(() => {
  vi.useRealTimers();
});

describe("createSupabaseFetchWithTimeout", () => {
  it("passes through successful responses", async () => {
    const response = new Response("ok");
    const fetchWithTimeout = createSupabaseFetchWithTimeout(
      100,
      vi.fn<typeof fetch>().mockResolvedValue(response),
    );

    await expect(fetchWithTimeout("https://example.com")).resolves.toBe(response);
  });

  it("rejects slow responses with a timeout error", async () => {
    vi.useFakeTimers();

    const fetchWithTimeout = createSupabaseFetchWithTimeout(
      100,
      vi.fn<typeof fetch>().mockImplementation((_input, init) => {
        const signal = init?.signal;

        return new Promise<Response>((_resolve, reject) => {
          if (!signal) {
            return;
          }

          const abort = () => {
            reject(
              signal.reason instanceof Error
                ? signal.reason
                : new DOMException("Aborted", "AbortError"),
            );
          };

          if (signal.aborted) {
            abort();
            return;
          }

          signal.addEventListener("abort", abort, { once: true });
        });
      }),
    );

    const request = fetchWithTimeout("https://example.com").catch((error: unknown) => error);

    await vi.advanceTimersByTimeAsync(100);

    const error = await request;

    expect(error).toBeInstanceOf(SupabaseRequestTimeoutError);
  });
});

describe("getUserSafely", () => {
  it("returns users from successful lookups", async () => {
    const user = {
      id: "user-1",
      app_metadata: {},
      user_metadata: {},
      aud: "authenticated",
      created_at: "2026-03-24T00:00:00.000Z",
    };

    const result = await getUserSafely({
      auth: {
        getUser: vi.fn().mockResolvedValue({
          data: { user },
          error: null,
        }),
      },
    });

    expect(result).toEqual({
      user,
      error: null,
      unavailable: false,
    });
  });

  it("treats thrown auth errors as a degraded auth service", async () => {
    const result = await getUserSafely({
      auth: {
        getUser: vi.fn().mockRejectedValue(new SupabaseRequestTimeoutError(100)),
      },
    });

    expect(result.user).toBeNull();
    expect(result.error).toBeInstanceOf(SupabaseRequestTimeoutError);
    expect(result.unavailable).toBe(true);
  });
});
