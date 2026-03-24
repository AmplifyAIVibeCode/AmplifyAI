import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

const serverEnvSchema = publicEnvSchema.extend({
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_MODEL: z.string().min(1).optional(),
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
    ANTHROPIC_API_KEY: process.env.ANTHROPIC_API_KEY,
    ANTHROPIC_MODEL: process.env.ANTHROPIC_MODEL,
  });
  if (!parsed.success) {
    throw new Error(
      `Missing/invalid env: ${formatZodError(parsed.error)}. Create .env.local from .env.example.`,
    );
  }
  cachedServerEnv = parsed.data;
  return parsed.data;
}

