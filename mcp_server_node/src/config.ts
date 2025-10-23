import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const EnvSchema = z.object({
  MCP_HTTP_PORT: z.coerce.number().int().positive().default(8889),
  STYTCH_PROJECT_ID: z.string(),
  STYTCH_PROJECT_SECRET: z.string(),
  STYTCH_DOMAIN: z.string().url(),
  FRONTEND_DOMAIN: z.string().url(),
});

const parsedEnv = EnvSchema.safeParse(process.env);

if (!parsedEnv.success) {
  if (process.stdout.isTTY) {
    console.error(
      '❌ Invalid environment variables found:',
      parsedEnv.error.flatten().fieldErrors
    );
  }
  process.exit(1);
}

export const config = parsedEnv.data;
