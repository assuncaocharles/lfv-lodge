"use client";

import useSWR, { type SWRConfiguration } from "swr";

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new Error(data?.error ?? `Erro ao carregar dados`);
  }
  return res.json();
}

/**
 * Client-side data fetching hook using SWR.
 *
 * Usage:
 *   const { data, error, isLoading, mutate } = useFetch<Member[]>("/api/membros");
 *
 * The `mutate` function can be used to:
 * - Revalidate: `mutate()` — refetches from API
 * - Optimistic update: `mutate(newData, false)` — updates cache without refetch
 */
export function useFetch<T>(url: string | null, config?: SWRConfiguration<T>) {
  return useSWR<T>(url, fetcher, {
    revalidateOnFocus: false,
    dedupingInterval: 5000,
    ...config,
  });
}
