"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";

/**
 * Helper for binding admin tables to URL search params.
 *
 * Returns a setter that performs a shallow router replace with the merged
 * params. Empty values delete the key.
 */
export function useSearchParamsState() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setParams = useCallback(
    (next: Record<string, string | number | undefined | null>) => {
      const sp = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(next)) {
        if (value === undefined || value === null || value === "") {
          sp.delete(key);
        } else {
          sp.set(key, String(value));
        }
      }
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname);
    },
    [pathname, router, searchParams]
  );

  return { searchParams, setParams };
}
