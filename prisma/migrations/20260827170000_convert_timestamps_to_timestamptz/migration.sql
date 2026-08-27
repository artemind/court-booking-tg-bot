-- Stored values are UTC instants (the app writes via dayjs.utc()), so reinterpret them as UTC
-- explicitly instead of relying on the session TimeZone at migration time.

-- AlterTable
ALTER TABLE "bookings"
  ALTER COLUMN "date_from" TYPE TIMESTAMPTZ(3) USING "date_from" AT TIME ZONE 'UTC',
  ALTER COLUMN "date_till" TYPE TIMESTAMPTZ(3) USING "date_till" AT TIME ZONE 'UTC',
  ALTER COLUMN "notified_before_start_at" TYPE TIMESTAMPTZ(3) USING "notified_before_start_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "notified_before_end_at" TYPE TIMESTAMPTZ(3) USING "notified_before_end_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';

-- AlterTable
ALTER TABLE "users"
  ALTER COLUMN "created_at" TYPE TIMESTAMPTZ(3) USING "created_at" AT TIME ZONE 'UTC',
  ALTER COLUMN "updated_at" TYPE TIMESTAMPTZ(3) USING "updated_at" AT TIME ZONE 'UTC';
