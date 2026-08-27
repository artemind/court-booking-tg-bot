-- CreateIndex
CREATE INDEX "bookings_court_id_date_from_idx" ON "bookings"("court_id", "date_from");

-- CreateIndex
CREATE INDEX "bookings_user_id_date_till_idx" ON "bookings"("user_id", "date_till");

-- CreateIndex
CREATE INDEX "bookings_notified_before_start_at_date_from_idx" ON "bookings"("notified_before_start_at", "date_from");

-- CreateIndex
CREATE INDEX "bookings_notified_before_end_at_date_till_idx" ON "bookings"("notified_before_end_at", "date_till");
