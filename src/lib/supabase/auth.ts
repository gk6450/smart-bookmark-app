import type { AuthError, User } from "@supabase/supabase-js";

type AuthClient = {
  auth: {
    getUser: () => Promise<{
      data: {
        user: User | null;
      };
      error: AuthError | null;
    }>;
  };
};

type GetUserSafelyResult = {
  user: User | null;
  error: AuthError | Error | null;
  unavailable: boolean;
};

export async function getUserSafely(client: AuthClient): Promise<GetUserSafelyResult> {
  try {
    const {
      data: { user },
      error,
    } = await client.auth.getUser();

    return {
      user,
      error,
      unavailable: false,
    };
  } catch (error) {
    return {
      user: null,
      error: error instanceof Error ? error : new Error("Unexpected authentication error."),
      unavailable: true,
    };
  }
}
