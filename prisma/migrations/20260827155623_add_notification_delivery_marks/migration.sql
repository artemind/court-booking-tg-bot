-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "notified_before_start_at" TIMESTAMP(3),
ADD COLUMN     "notified_before_end_at" TIMESTAMP(3);
