import { z } from "zod";

const envSchema = z.object({
  // App
  APP_URL: z.string().url().default("http://localhost:3000"),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Database
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  DIRECT_URL: z.string().optional().default(""),

  // Auth
  AUTH_SECRET: z.string().min(16, "AUTH_SECRET must be at least 16 chars"),
  AUTH_URL: z.string().url().optional(),
  SUPERADMIN_EMAIL: z.string().email().optional(),
  SUPERADMIN_PASSWORD: z.string().min(6).optional(),

  // Upstash
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),

  // AI
  OPENAI_API_KEY: z.string().optional().default(""),
  GEMINI_API_KEY: z.string().optional().default(""),
  AI_PROVIDER: z.enum(["openai", "gemini", "mock"]).default("mock"),
  AI_RECOMMENDATION_MODEL: z.string().optional().default("gpt-5.4-mini"),
  AI_PLAN_MODEL: z.string().optional().default("gpt-5.4-mini"),

  // Midtrans
  MIDTRANS_SERVER_KEY: z.string().optional().default(""),
  MIDTRANS_CLIENT_KEY: z.string().optional().default(""),
  MIDTRANS_IS_PRODUCTION: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
  MIDTRANS_FINISH_REDIRECT_URL: z
    .string()
    .url()
    .default("http://localhost:3000/payment/finish"),
  MIDTRANS_UNFINISH_REDIRECT_URL: z
    .string()
    .url()
    .default("http://localhost:3000/payment/unfinish"),
  MIDTRANS_ERROR_REDIRECT_URL: z
    .string()
    .url()
    .default("http://localhost:3000/payment/error"),

  // PDF Storage
  PDF_STORAGE_DRIVER: z.enum(["local", "supabase", "s3"]).default("local"),
  SUPABASE_STORAGE_URL: z.string().optional().default(""),
  SUPABASE_STORAGE_KEY: z.string().optional().default(""),
  SUPABASE_STORAGE_SECRET: z.string().optional().default(""),
  SUPABASE_STORAGE_REGION: z.string().optional().default("ap-southeast-1"),
  SUPABASE_STORAGE_BUCKET: z.string().optional().default(""),
  S3_ACCESS_KEY_ID: z.string().optional().default(""),
  S3_SECRET_ACCESS_KEY: z.string().optional().default(""),
  S3_BUCKET: z.string().optional().default(""),
  S3_REGION: z.string().optional().default(""),
  S3_ENDPOINT: z.string().optional().default(""),

  // Email (Resend)
  RESEND_API_KEY: z.string().optional().default(""),
  RESEND_FROM_EMAIL: z.string().optional().default("JuruScope <support@juruscope.id>"),
  RESEND_WEBHOOK_SECRET: z.string().optional().default(""),
  SUPPORT_EMAIL: z.string().optional().default("support@juruscope.id"),
  EMAIL_DEV_MODE: z
    .string()
    .optional()
    .default("")
    .transform((v) => (v === "" ? undefined : v === "true")),

  // Inngest (background queue)
  INNGEST_EVENT_KEY: z.string().optional().default(""),
  INNGEST_SIGNING_KEY: z.string().optional().default(""),
  ENABLE_SYNC_FALLBACK: z
    .string()
    .optional()
    .default("false")
    .transform((v) => v === "true"),
});

export type AppEnv = z.infer<typeof envSchema>;

function parseEnv(): AppEnv {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  - ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    console.error("\n❌ Invalid environment variables:\n" + issues + "\n");
    throw new Error("Invalid environment variables");
  }
  return parsed.data;
}

export const env: AppEnv = parseEnv();
