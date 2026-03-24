export const SUPABASE_REQUEST_TIMEOUT_MS = 4_000;

export const AUTH_SERVICE_UNAVAILABLE_MESSAGE =
  "Authentication service is temporarily unavailable. Please try again in a moment.";

export const BOOKMARKS_SERVICE_UNAVAILABLE_MESSAGE =
  "Bookmarks are temporarily unavailable. Please refresh in a moment.";

export class SupabaseRequestTimeoutError extends Error {
  constructor(timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS) {
    super(`Supabase request timed out after ${timeoutMs}ms.`);
    this.name = "SupabaseRequestTimeoutError";
  }
}

export function getSupabaseEnvironment() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    throw new Error(
      "Missing Supabase environment variables. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return { url, anonKey };
}

export function createSupabaseFetchWithTimeout(
  timeoutMs = SUPABASE_REQUEST_TIMEOUT_MS,
  fetchImplementation: typeof fetch = fetch,
): typeof fetch {
  return async (input, init) => {
    const controller = new AbortController();
    const upstreamSignal = init?.signal;
    const abortFromUpstream = () => controller.abort(upstreamSignal?.reason);

    if (upstreamSignal) {
      if (upstreamSignal.aborted) {
        controller.abort(upstreamSignal.reason);
      } else {
        upstreamSignal.addEventListener("abort", abortFromUpstream, { once: true });
      }
    }

    const timeoutId = setTimeout(() => {
      controller.abort(new SupabaseRequestTimeoutError(timeoutMs));
    }, timeoutMs);

    try {
      return await fetchImplementation(input, {
        ...init,
        signal: controller.signal,
      });
    } catch (error) {
      if (controller.signal.aborted && controller.signal.reason instanceof Error) {
        throw controller.signal.reason;
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
      upstreamSignal?.removeEventListener("abort", abortFromUpstream);
    }
  };
}
