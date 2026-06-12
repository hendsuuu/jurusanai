import type { NextRequest } from "next/server";
import { ok, fail } from "@/server/utils/api-response";
import { requireSuperadmin } from "@/server/auth/guard";
import { listTickets } from "@/server/support/support.service";
import { AppError } from "@/server/utils/error";
import { logger } from "@/server/utils/logger";
import type { SupportTicketPriority, SupportTicketStatus } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireSuperadmin();

    const sp = req.nextUrl.searchParams;
    const page = Number(sp.get("page") ?? 1);
    const limit = Number(sp.get("limit") ?? 20);
    const status = (sp.get("status") as SupportTicketStatus) || undefined;
    const priority = (sp.get("priority") as SupportTicketPriority) || undefined;
    const search = sp.get("search") || undefined;

    const data = await listTickets({ page, limit, status, priority, search });
    return ok(data);
  } catch (error) {
    if (error instanceof AppError) return fail(error.message, error.status);
    logger.error("admin.support-tickets.list failed", error);
    return fail("Gagal mengambil support tickets", 500);
  }
}
