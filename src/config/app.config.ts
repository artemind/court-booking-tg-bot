import { z } from 'zod';

const timeSchema = z.string().regex(/^\d{2}:\d{2}$/, 'must be in HH:mm format');

const envSchema = z.object({
  BOT_TOKEN: z.string().min(1, 'is required'),
  APP_LOCALE: z.string().default('en'),
  APP_TIMEZONE: z.string().default('UTC'),
  BOOKING_AVAILABLE_FROM_TIME: timeSchema.default('07:00'),
  BOOKING_AVAILABLE_TO_TIME: timeSchema.default('23:59'),
  BOOKING_SLOT_SIZE_IN_MINUTES: z.coerce.number().int().positive().default(30),
  BOOKING_MIN_DURATION_MINUTES: z.coerce.number().int().positive().default(30),
  BOOKING_MAX_DURATION_MINUTES: z.coerce.number().int().positive().default(180),
  BOOKING_DAYS_AHEAD: z.coerce.number().int().positive().default(7),
  NOTIFICATION_MINUTES_BEFORE_START: z.coerce.number().int().nonnegative().default(30),
  NOTIFICATION_MINUTES_BEFORE_END: z.coerce.number().int().nonnegative().default(15),
});

export type AppConfig = z.infer<typeof envSchema>;

export function loadAppConfig(env: NodeJS.ProcessEnv = process.env): AppConfig {
  const result = envSchema.safeParse(env);
  if (!result.success) {
    const issues = result.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join('; ');
    throw new Error(`Invalid environment configuration: ${issues}`);
  }

  return result.data;
}
