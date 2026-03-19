import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  OPENAI_API_KEY: z.string().min(1).optional(),
  OPENAI_REPLY_MODEL: z.string().min(1).optional(),
});

let cachedPublicEnv: z.infer<typeof publicEnvSchema> | null = null;
let cachedServerEnv: z.infer<typeof serverEnvSchema> | null = null;

function formatZodError(error: z.ZodError) {
  const keys = error.issues.map((i) => i.path.join(".")).filter(Boolean);
  const unique = Array.from(new Set(keys));
  return unique.length ? unique.join(", ") : "environment variables";
}

export function getPublicEnv() {
  if (cachedPublicEnv) return cachedPublicEnv;
  const parsed = publicEnvSchema.safeParse({
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  });
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid env: ${formatZodError(parsed.error)}. Create .env.local from .env.example.`,
    );
  }
  cachedPublicEnv = parsed.data;
  return parsed.data;
}

export function getServerEnv() {
  if (cachedServerEnv) return cachedServerEnv;
  const parsed = serverEnvSchema.safeParse({
    ...getPublicEnv(),
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    OPENAI_REPLY_MODEL: process.env.OPENAI_REPLY_MODEL,
  });
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid env: ${formatZodError(parsed.error)}. Create .env.local from .env.example.`,
    );
  }
  cachedServerEnv = parsed.data;
  return parsed.data;
}

