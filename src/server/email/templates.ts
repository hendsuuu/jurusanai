/**
 * Plain-HTML email templates. We avoid React Email here to keep the
 * dependency surface small. The brand styling mirrors the PDF (army green +
 * cream accent) so emails feel consistent with the report.
 */

export type PdfReportEmailParams = {
  customerName: string | null;
  /** Personality identity / report subject (kept name for backward-compat). */
  businessIdeaName: string | null;
  packageType: "BASIC" | "PREMIUM" | "PRO";
  amount: number;
  orderCode: string;
  /** Absolute URL to the PDF download endpoint (or storage). */
  pdfUrl: string;
  /** Public site URL for branding link. */
  siteUrl: string;
};

function fmtIDR(amount: number) {
  return `Rp${Math.round(amount).toLocaleString("id-ID")}`;
}

function esc(value: string | null | undefined) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Subject line — concise, recognizable from the inbox.
 */
export function pdfReportSubject(_params: PdfReportEmailParams): string {
  return `Hasil Analisis JuruScope Kamu Sudah Siap 🚀`;
}

export function pdfReportPlainText(params: PdfReportEmailParams): string {
  const lines = [
    `Hai${params.customerName ? " " + params.customerName : ""},`,
    "",
    `Self discovery report kamu sudah siap.`,
    "",
    `Paket: ${params.packageType}`,
    `Order: ${params.orderCode}`,
    `Total dibayar: ${fmtIDR(params.amount)}`,
    "",
    `Download report:`,
    params.pdfUrl,
    "",
    `Terima kasih sudah menggunakan JuruScope.`,
    `${params.siteUrl}`,
  ];
  return lines.join("\n");
}

export function pdfReportHtml(params: PdfReportEmailParams): string {
  const greeting = params.customerName
    ? `Hai ${esc(params.customerName)},`
    : "Hai,";

  return `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(pdfReportSubject(params))}</title>
</head>
<body style="margin:0;padding:0;background:#F0EEDD;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2A311A;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F0EEDD;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 1px 3px rgba(15,23,42,0.06);">
          <!-- Hero -->
          <tr>
            <td style="background:linear-gradient(135deg,#4B5320 0%,#3A4327 100%);padding:28px 28px 24px;color:#ffffff;border-radius:16px 16px 0 0;">
              <div style="display:flex;align-items:center;gap:8px;">
                <img src="${esc(params.siteUrl)}/logo.png" alt="J" width="28" height="28" style="display:inline-block;width:28px;height:28px;border-radius:7px;" />
                <span style="font-weight:700;font-size:14px;letter-spacing:0.4px;color:#FFFFFF;">Juru<span style="opacity:0.85;">Scope</span></span>
              </div>
              <h1 style="margin:18px 0 6px;font-size:22px;line-height:1.25;font-weight:800;">Hasil analisis kamu siap.</h1>
              <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.85);line-height:1.55;">Self discovery report kamu sudah selesai dibuat dan siap kamu unduh.</p>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:24px 28px 8px;color:#2A311A;font-size:14px;line-height:1.6;">
              <p style="margin:0 0 12px;">${greeting}</p>
              <p style="margin:0 0 16px;">Terima kasih sudah mengenal dirimu lebih dalam bersama JuruScope. Kamu bisa langsung mengunduh laporan lengkap dengan mengklik tombol di bawah.</p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 12px;">
                <tr>
                  <td style="background:#4B5320;border-radius:12px;">
                    <a href="${esc(params.pdfUrl)}" target="_blank" rel="noopener" style="display:inline-block;padding:14px 24px;color:#ffffff;font-weight:700;text-decoration:none;font-size:14px;border-radius:12px;">Download Self Discovery Report</a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 6px;font-size:12px;color:#6E725A;">Atau salin link ini ke browser:</p>
              <p style="margin:0 0 16px;font-size:12px;color:#4B5320;word-break:break-all;"><a href="${esc(params.pdfUrl)}" style="color:#4B5320;">${esc(params.pdfUrl)}</a></p>
            </td>
          </tr>
          <!-- Order summary -->
          <tr>
            <td style="padding:8px 28px 4px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F6F4E9;border:1px solid #DDD9BD;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;font-size:11px;color:#6E725A;text-transform:uppercase;letter-spacing:0.6px;font-weight:600;">Detail order</p>
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;font-size:13px;">
                      <tr>
                        <td style="color:#57604A;padding:3px 0;">Paket</td>
                        <td align="right" style="color:#2A311A;padding:3px 0;font-weight:600;">${esc(params.packageType)}</td>
                      </tr>
                      <tr>
                        <td style="color:#57604A;padding:3px 0;">Order Code</td>
                        <td align="right" style="color:#2A311A;padding:3px 0;font-family:ui-monospace,Menlo,Consolas,monospace;font-size:12px;">${esc(params.orderCode)}</td>
                      </tr>
                      <tr>
                        <td style="color:#57604A;padding:3px 0;">Total Dibayar</td>
                        <td align="right" style="color:#2A311A;padding:3px 0;font-weight:700;">${esc(fmtIDR(params.amount))}</td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Disclaimer -->
          <tr>
            <td style="padding:14px 28px 18px;color:#57604A;font-size:12px;line-height:1.55;">
              <p style="margin:0;">Hasil JuruScope adalah panduan untuk mengenal diri dan menentukan arah, bukan keputusan mutlak. Gunakan sebagai bahan refleksi dan diskusi sebelum memilih jurusan.</p>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background:#F6F4E9;padding:16px 28px;border-top:1px solid #DDD9BD;color:#8A8A72;font-size:11px;text-align:center;">
              © ${new Date().getFullYear()} JuruScope · Kenali dirimu sebelum menentukan masa depan · <a href="${esc(params.siteUrl)}" style="color:#8A8A72;text-decoration:none;">${esc(params.siteUrl.replace(/^https?:\/\//, ""))}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
