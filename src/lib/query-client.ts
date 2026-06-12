import { QueryClient } from "@tanstack/react-query";

export function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        // Fresh for 2 minutes by default — admin tables don't change every second
        staleTime: 2 * 60_000,
        // Keep cache 10 minutes after last use so Back-navigation feels instant
        gcTime: 10 * 60_000,
        retry: 1,
        // Avoid refetching when admin tabs back to a page they already loaded
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        // Use cached data on remount; fetch in background only if stale
        refetchOnMount: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export type AdminOrderQueryParams = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
};

export type AdminPlanQueryParams = {
  page: number;
  limit: number;
  status?: string;
  search?: string;
};

export type AdminLogQueryParams = {
  page: number;
  limit: number;
  action?: string;
  entityType?: string;
  entityId?: string;
};

export const queryKeys = {
  planner: {
    preview: (planId: string) => ["planner", "preview", planId] as const,
  },
  orders: {
    detail: (orderId: string) => ["orders", "detail", orderId] as const,
  },
  admin: {
    overview: ["admin", "overview"] as const,
    orders: (params: AdminOrderQueryParams) =>
      ["admin", "orders", params] as const,
    orderDetail: (orderId: string) =>
      ["admin", "orders", "detail", orderId] as const,
    plans: (params: AdminPlanQueryParams) =>
      ["admin", "plans", params] as const,
    planDetail: (planId: string) =>
      ["admin", "plans", "detail", planId] as const,
    logs: (params: AdminLogQueryParams) =>
      ["admin", "logs", params] as const,
  },
};
