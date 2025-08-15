-- AlterTable
ALTER TABLE "public"."users" ADD COLUMN     "notify_before_booking_ends" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "notify_before_booking_starts" BOOLEAN NOT NULL DEFAULT true;
