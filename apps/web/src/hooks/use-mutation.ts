"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

interface MutationOptions {
  onSuccess?: () => void;
}

/**
 * Hook for handling API mutations with proper loading/error/refresh states.
 *
 * After a successful mutation, calls router.refresh() to revalidate server data,
 * then waits a tick for React to process the update before calling onSuccess.
 */
export function useMutation(options?: MutationOptions) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (fn: () => Promise<Response | void>) => {
      setIsPending(true);
      setError(null);

      try {
        const res = await fn();

        // If the function returns a Response, check if it's ok
        if (res && !res.ok) {
          const data = await res.json().catch(() => null);
          throw new Error(data?.error ?? "Ocorreu um erro");
        }

        // Refresh server data and wait for it to settle
        router.refresh();
        // Give React time to process the refresh before signaling success
        await new Promise((r) => setTimeout(r, 300));

        options?.onSuccess?.();
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Ocorreu um erro inesperado"
        );
        return false;
      } finally {
        setIsPending(false);
      }
    },
    [router, options]
  );

  return { mutate, isPending, error, setError };
}
