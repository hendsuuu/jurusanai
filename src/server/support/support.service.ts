import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";
import { logger } from "@/server/utils/logger";
import { getResendClient } from "@/server/email/resend.client";
import type { Prisma, SupportTicketPriority, SupportTicketStatus } from "@prisma/client";

// ─── Helpers ─────────────────────────────────────────────────────────────

/** Strip HTML tags to get plain text fallback when text body is missing. */
function stripHtml(html: string | null | undefined): string | null {
  if (!html) return null;
  const text = html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<\/div>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
  return text || null;
}

/**
 * Strip quoted reply from email body. Email clients append the previous
 * conversation below the user's new message with various markers:
 *
 * Gmail:    "On Mon, Jan 1, 2026 at 10:00 AM Name <email> wrote:"
 * Gmail ID: "Pada Rab. 20 Mei 2026 pukul 21.55 Name <email> menulis:"
 * Outlook:  "-----Original Message-----" or "From: ..."
 * Apple:    "> On Jan 1, 2026, at 10:00 AM, Name <email> wrote:"
 * Generic:  Lines starting with ">" (blockquote)
 *
 * We cut everything from the first quote marker onwards.
 */
function stripQuotedReply(text: string | null | undefined): string | null {
  if (!text) return null;

  const lines = text.split("\n");
  let cutIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Gmail English: "On ... wrote:"
    if (/^On .+ wrote:\s*$/i.test(line)) {
      cutIndex = i;
      break;
    }

    // Gmail Indonesian: "Pada ... menulis:"
    if (/^Pada .+ menulis:\s*$/i.test(line)) {
      cutIndex = i;
      break;
    }

    // Outlook: "-----Original Message-----"
    if (/^-{3,}\s*Original Message\s*-{3,}$/i.test(line)) {
      cutIndex = i;
      break;
    }

    // Outlook: "From: ..." at start of quoted section (after blank line)
    if (i > 0 && lines[i - 1].trim() === "" && /^From:\s+.+/i.test(line)) {
      cutIndex = i;
      break;
    }

    // Apple Mail / generic: line starts with ">" (quoted text block)
    // Only trigger if we see 2+ consecutive ">" lines (to avoid false
    // positives from user typing ">")
    if (line.startsWith(">") && i + 1 < lines.length && lines[i + 1].trim().startsWith(">")) {
      // Walk back to find the "wrote:" line above if any
      if (i > 0 && /wrote:\s*$|menulis:\s*$/i.test(lines[i - 1])) {
        cutIndex = i - 1;
      } else {
        cutIndex = i;
      }
      break;
    }
  }

  const fresh = lines.slice(0, cutIndex).join("\n").trim();
  return fresh || null;
}

// ─── Ticket Number Generator ─────────────────────────────────────────────

async function generateTicketNumber(): Promise<string> {
  const now = new Date();
  const dateStr = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("");

  const prefix = `BA-SUP-${dateStr}-`;

  // Count tickets created today to get next sequence
  const startOfDay = new Date(now);
  startOfDay.setHours(0, 0, 0, 0);
  const count = await prisma.supportTicket.count({
    where: { createdAt: { gte: startOfDay } },
  });

  const seq = String(count + 1).padStart(4, "0");
  return `${prefix}${seq}`;
}

// ─── Auto Priority Detection ─────────────────────────────────────────────

function detectPriority(subject: string, message: string): SupportTicketPriority {
  const content = `${subject} ${message}`.toLowerCase();

  if (
    content.includes("sudah bayar") ||
    content.includes("pembayaran berhasil") ||
    content.includes("pdf gagal") ||
    content.includes("gagal generate") ||
    content.includes("belum menerima pdf") ||
    content.includes("business plan tidak muncul")
  ) {
    return "URGENT";
  }

  if (
    content.includes("refund") ||
    content.includes("uang kembali") ||
    content.includes("komplain")
  ) {
    return "HIGH";
  }

  if (content.includes("saran") || content.includes("feedback")) {
    return "LOW";
  }

  return "NORMAL";
}

// ─── Ticket Number Extraction ────────────────────────────────────────────

const TICKET_RE = /BA-SUP-\d{8}-\d{4}/;

function extractTicketNumber(subject: string): string | null {
  const match = subject.match(TICKET_RE);
  return match ? match[0] : null;
}

// ─── Create Ticket from Inbound Email ────────────────────────────────────

export type InboundEmailData = {
  resendEmailId?: string;
  fromEmail: string;
  fromName?: string | null;
  toEmail: string;
  subject: string;
  messageText?: string | null;
  messageHtml?: string | null;
};

export async function processInboundEmail(data: InboundEmailData) {
  // Idempotency: check if already processed
  if (data.resendEmailId) {
    const existing = await prisma.supportTicket.findUnique({
      where: { resendEmailId: data.resendEmailId },
    });
    if (existing) {
      logger.info(`[support] Duplicate email ${data.resendEmailId}, skipping`);
      return { action: "duplicate", ticketId: existing.id };
    }
  }

  // Check if this is a reply to an existing ticket (subject contains ticket number)
  const ticketNumber = extractTicketNumber(data.subject);
  if (ticketNumber) {
    const existingTicket = await prisma.supportTicket.findUnique({
      where: { ticketNumber },
    });
    if (existingTicket) {
      // Add as reply to existing ticket
      await prisma.supportTicketReply.create({
        data: {
          supportTicketId: existingTicket.id,
          senderType: "USER",
          senderEmail: data.fromEmail,
          senderName: data.fromName,
          messageText: stripQuotedReply(data.messageText) || stripQuotedReply(stripHtml(data.messageHtml)) || null,
          messageHtml: data.messageHtml,
        },
      });

      // Reopen if closed
      if (existingTicket.status === "CLOSED" || existingTicket.status === "RESOLVED") {
        await prisma.supportTicket.update({
          where: { id: existingTicket.id },
          data: { status: "OPEN" },
        });
      }

      logger.info(
        `[support] Reply added to ticket ${ticketNumber} from ${data.fromEmail}`
      );
      return { action: "reply_added", ticketId: existingTicket.id, ticketNumber };
    }
  }

  // Create new ticket
  const newTicketNumber = await generateTicketNumber();
  const rawBody = data.messageText || stripHtml(data.messageHtml) || "";
  const cleanBody = stripQuotedReply(rawBody) || "";
  const priority = detectPriority(data.subject, cleanBody);

  // Try to find related user/order
  const user = await prisma.user.findFirst({
    where: { email: data.fromEmail },
    select: { id: true },
  });
  const latestOrder = user
    ? await prisma.order.findFirst({
        where: { customerEmail: data.fromEmail, status: "SUCCESS" },
        orderBy: { createdAt: "desc" },
        select: { id: true },
      })
    : null;

  const ticket = await prisma.supportTicket.create({
    data: {
      ticketNumber: newTicketNumber,
      fromEmail: data.fromEmail,
      fromName: data.fromName,
      toEmail: data.toEmail,
      subject: data.subject || "(No Subject)",
      // Strip quoted reply and fallback to HTML-stripped if text is empty
      messageText: stripQuotedReply(data.messageText) || stripQuotedReply(stripHtml(data.messageHtml)) || null,
      messageHtml: data.messageHtml,
      status: "OPEN",
      priority,
      source: "EMAIL",
      userId: user?.id ?? null,
      orderId: latestOrder?.id ?? null,
      resendEmailId: data.resendEmailId ?? null,
    },
  });

  logger.info(
    `[support] New ticket ${newTicketNumber} from ${data.fromEmail} (priority: ${priority})`
  );

  // Send auto-reply
  await sendAutoReply(data.fromEmail, data.fromName, newTicketNumber);

  return { action: "ticket_created", ticketId: ticket.id, ticketNumber: newTicketNumber };
}

// ─── Auto Reply ──────────────────────────────────────────────────────────

async function sendAutoReply(
  toEmail: string,
  toName: string | null | undefined,
  ticketNumber: string
) {
  const resend = getResendClient();
  if (!resend) return;

  const isDevMode =
    env.EMAIL_DEV_MODE !== undefined
      ? env.EMAIL_DEV_MODE
      : env.NODE_ENV !== "production";

  const fromAddress = isDevMode
    ? "JuruScope Support <onboarding@resend.dev>"
    : `JuruScope Support <${env.SUPPORT_EMAIL}>`;

  const subject = `[${ticketNumber}] Email bantuan kamu sudah kami terima`;
  const greeting = toName ? `Halo ${toName},` : "Halo,";

  const text = `${greeting}

Terima kasih sudah menghubungi JuruScope.

Email kamu sudah kami terima dengan nomor tiket:
${ticketNumber}

Tim kami akan meninjau kendala kamu dan menghubungi kembali melalui email ini.

Jika kendala kamu terkait pembayaran atau report yang gagal dibuat, mohon pastikan kamu sudah menyertakan:
- Email yang digunakan saat order
- Paket yang dibeli
- Bukti pembayaran jika tersedia
- Detail kendala yang dialami

Terima kasih,
Tim Support JuruScope`;

  try {
    await resend.emails.send({
      from: fromAddress,
      to: toEmail,
      subject,
      text,
    });
    logger.info(`[support] Auto-reply sent for ${ticketNumber} to ${toEmail}`);
  } catch (err) {
    logger.error("[support] Auto-reply failed", err);
  }
}

// ─── Admin: List Tickets ─────────────────────────────────────────────────

export type ListTicketsArgs = {
  page: number;
  limit: number;
  status?: SupportTicketStatus;
  priority?: SupportTicketPriority;
  search?: string;
};

export async function listTickets(args: ListTicketsArgs) {
  const where: Prisma.SupportTicketWhereInput = {};
  if (args.status) where.status = args.status;
  if (args.priority) where.priority = args.priority;
  if (args.search) {
    where.OR = [
      { ticketNumber: { contains: args.search, mode: "insensitive" } },
      { subject: { contains: args.search, mode: "insensitive" } },
      { fromEmail: { contains: args.search, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.supportTicket.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (args.page - 1) * args.limit,
      take: args.limit,
    }),
    prisma.supportTicket.count({ where }),
  ]);

  return {
    items,
    meta: {
      page: args.page,
      limit: args.limit,
      total,
      totalPage: Math.max(1, Math.ceil(total / args.limit)),
    },
  };
}

// ─── Admin: Get Ticket Detail ────────────────────────────────────────────

export async function getTicketDetail(ticketId: string) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      replies: { orderBy: { createdAt: "asc" } },
    },
  });
  return ticket;
}

// ─── Admin: Update Status ────────────────────────────────────────────────

export async function updateTicketStatus(ticketId: string, status: SupportTicketStatus) {
  const data: Prisma.SupportTicketUpdateInput = { status };
  if (status === "RESOLVED") data.resolvedAt = new Date();
  return prisma.supportTicket.update({ where: { id: ticketId }, data });
}

// ─── Admin: Update Priority ──────────────────────────────────────────────

export async function updateTicketPriority(ticketId: string, priority: SupportTicketPriority) {
  return prisma.supportTicket.update({
    where: { id: ticketId },
    data: { priority },
  });
}

// ─── Admin: Reply to Ticket ──────────────────────────────────────────────

export async function replyToTicket(args: {
  ticketId: string;
  adminEmail: string;
  adminName: string | null;
  message: string;
}) {
  const ticket = await prisma.supportTicket.findUnique({
    where: { id: args.ticketId },
  });
  if (!ticket) throw new Error("Ticket not found");

  const resend = getResendClient();

  const isDevMode =
    env.EMAIL_DEV_MODE !== undefined
      ? env.EMAIL_DEV_MODE
      : env.NODE_ENV !== "production";

  const fromAddress = isDevMode
    ? "JuruScope Support <onboarding@resend.dev>"
    : `JuruScope Support <${env.SUPPORT_EMAIL}>`;

  const subject = `Re: [${ticket.ticketNumber}] ${ticket.subject}`;

  // Send email to user
  if (resend) {
    try {
      await resend.emails.send({
        from: fromAddress,
        to: ticket.fromEmail,
        subject,
        text: args.message,
      });
    } catch (err) {
      logger.error("[support] Reply email send failed", err);
    }
  }

  // Save reply
  const reply = await prisma.supportTicketReply.create({
    data: {
      supportTicketId: ticket.id,
      senderType: "ADMIN",
      senderEmail: args.adminEmail,
      senderName: args.adminName,
      messageText: args.message,
    },
  });

  // Update ticket status + first response
  const updateData: Prisma.SupportTicketUpdateInput = {
    status: "WAITING_USER",
  };
  if (!ticket.firstResponseAt) {
    updateData.firstResponseAt = new Date();
  }
  await prisma.supportTicket.update({
    where: { id: ticket.id },
    data: updateData,
  });

  return reply;
}

// ─── Count open tickets (for badge) ─────────────────────────────────────

export async function countOpenTickets(): Promise<number> {
  return prisma.supportTicket.count({ where: { status: "OPEN" } });
}
