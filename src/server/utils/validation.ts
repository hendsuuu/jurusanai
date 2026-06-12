import { z, ZodError, ZodType } from "zod";

export type FieldErrors = Record<string, string[]>;

export function flattenZodError(err: ZodError): FieldErrors {
  const result: FieldErrors = {};
  for (const issue of err.issues) {
    const path = issue.path.length > 0 ? issue.path.join(".") : "_";
    if (!result[path]) result[path] = [];
    result[path].push(issue.message);
  }
  return result;
}

export type ParseResult<T> =
  | { ok: true; data: T }
  | { ok: false; errors: FieldErrors };

export function safeParse<T>(schema: ZodType<T>, input: unknown): ParseResult<T> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, errors: flattenZodError(parsed.error) };
  return { ok: true, data: parsed.data };
}

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
});
