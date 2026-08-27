# Changelog

All notable changes to this project will be documented in this file.

## [2.3.0] - 2026-08-27

### Added
- Indexes on `Booking`: `[courtId, dateFrom]`, `[userId, dateTill]`, `[notifiedBeforeStartAt, dateFrom]`, `[notifiedBeforeEndAt, dateTill]` (migration `add_booking_indexes`), covering `getByDate`, `createIfAvailable`, `getUpcomingByUserId`, and `getBookingsToBeNotified`
- `notifiedBeforeStartAt` / `notifiedBeforeEndAt` fields on `Booking` (migration `add_notification_delivery_marks`) marking a notification as delivered
- `BookingService.claimNotification()` / `BookingService.releaseNotification()` — a notification is claimed atomically before it is sent and released when delivery fails, so it is retried on a later tick
- `NotificationScheduler.stop()` and the exported `NOTIFICATION_CRON_EXPRESSION`
- Tests for the notification window, delivery marks, claim/release, and the scheduler failure paths
- Graceful shutdown: `SIGINT`/`SIGTERM` stop the bot and the notification scheduler and disconnect Prisma before exit; `unhandledRejection`/`uncaughtException` are logged and exit the process with code 1
- `Bot.stop()`

### Changed
- All `TIMESTAMP(3)` columns on `bookings` and `users` converted to `TIMESTAMPTZ(3)` (migration `convert_timestamps_to_timestamptz`), matching the app's UTC-based `dayjs` usage
- `BookingService.getBookingsToBeNotified()` returns `PendingNotification[]` tagged with a `kind` (`start` / `end`) instead of raw bookings; a single booking can now yield both notifications
- `SendNotificationAction.run()` takes the notification kind explicitly instead of inferring it from the current time
- `NotificationScheduler` runs every minute instead of every 15 minutes, since the notification lead times are configurable and need not align with a coarser interval
- Failed notification deliveries are logged with the booking id and notification kind instead of being discarded by `Promise.allSettled`
- `User.telegramUsername` is now nullable (migration `make_telegram_username_nullable`), since a Telegram username is optional

### Fixed
- Users without a Telegram `@username` were unable to use the bot at all: `AppendUserMiddleware` threw `UserNotFoundException` for them. The guard now only requires a Telegram id
- Notifications were silently never sent when booking start/end times did not fall exactly on the scheduler tick, because the query matched an exact timestamp. Everything due within the lead time is now selected, so a missed tick is caught up on the next one and a duplicate is prevented by the delivery marks
- A start notification delivered late was rendered as an end notification
- A failure while loading due notifications no longer escapes the cron callback as an unhandled rejection
- `bootstrap()` failing on startup now exits with a non-zero code instead of just logging
- A failed reply from `bot.catch` (bot blocked, callback expired) no longer escapes as an unhandled rejection

## [2.2.0] - 2026-08-26

### Added
- `CreateBookingAction` — booking creation extracted from the duration handler
- `BookingService.createIfAvailable()` — creates a booking inside a transaction and throws `SlotConflictException` when the slot is already taken
- `SlotConflictException` with the `errors.slot_already_booked` message in `en`/`uk` locales
- `UserService.upsert()` used by `AppendUserMiddleware` instead of the manual find/create/update branching
- `UserNotFoundException` thrown by `AppendUserMiddleware` when the Telegram user data is missing
- `parseIntSafe()` utility and safer parsing of callback data across handlers
- `notification_preferences_updated` locale key
- Unit tests for the new actions (`choose-date`, `choose-time`, `create-booking`), `UserService.upsert()`, and booking conflict handling

### Changed
- `CronHandler` replaced with `NotificationScheduler` (tests renamed accordingly)
- Booking configuration centralized into `IBookingConfig` / `BOOKING_CONFIG_TOKEN` instead of reading env vars in place
- Date and time selection decoupled into separate `ChooseDateAction` / `ChooseTimeAction` and their handlers
- Session `dateAndTime` replaced with separate `date` and `time` fields
- Notification preferences logic consolidated into a single `run` method
- Booking exceptions propagated for centralized handling in `bot.ts`
- App initialization and dependency binding simplified in `app.ts`
- Tests compute future booking dates dynamically instead of using fixed dates

### Fixed
- `BookingService.getByDate()` now converts the end of the day to UTC

### Chore
- `tsconfig.json`: added `include` for TypeScript file discovery
- Docker: pinned `postgres:18`, fixed the data volume path, and made `node` depend on `postgres`
- Updated dependencies in `package-lock.json`

## [2.1.0] - 2026-05-02

### Added
- Testing infrastructure with Vitest: configuration, helpers (`create-mock-context`, `create-mock-prisma`), and coverage reporting
- Unit tests for all services: `BookingService`, `BookingSlotService`, `CourtService`, `UserService`
- Unit tests for all bot actions: booking flow, my-bookings, notification preferences, send-notification
- Unit tests for all bot handlers: start, main-menu, cron, booking flow, my-bookings, notification preferences
- Unit tests for middlewares: `AppendUserMiddleware`, `RestrictAccessMiddleware`, `StartSessionMiddleware`
- Unit tests for messages, keyboards, and formatters
- Unit tests for utility functions: array, date, and time utils

### Fixed
- Booking slot generation logic to correctly handle day boundary and configurable slot size
- ESLint configuration to include the `tests/` directory

### Chore
- Added `.gitattributes` for consistent line endings and Linguist configuration
- Updated `.dockerignore` to exclude test-related files and AI metadata

## [2.0.2] - 2025-10-10

- Update dependencies
- Add GitHub Actions

## [2.0.1] - 2025-08-19

### Fix
- Notification localization

## [2.0.0] - 2025-08-18

### Refactor
- Integrate InversifyJS for dependency injection
- Refactor handlers, services, and middlewares for DI support

## [1.2.0] - 2025-08-16

### Added
- Localization support for English and Ukrainian

## [1.1.0] - 2025-08-15

### Added
- Notification Preferences
- Notifications
  - Upcoming booking notification
  - Booking end reminder

## [1.0.1] - 2025-08-04

### Added
- My bookings cancellation

## [1.0.0] - 2025-08-04

### Added
- Initial release of Court Booking Telegram Bot
- Interactive court booking system with step-by-step flow
- User management and access control
- Real-time court availability checking
- Booking history and management
- Multi-language support with internationalization
- Configurable booking time slots and durations
- PostgreSQL database integration with Prisma ORM
- Modular architecture with clear separation of concerns
- Comprehensive error handling and validation
- Telegram bot integration using Telegraf framework
- TypeScript implementation for type safety
- Development and production build configurations
- ESLint code quality enforcement
- Docker support for containerized deployment

### Technical Features
- **Database Schema**: Users, Courts, and Bookings models
- **Bot Handlers**: Start, booking flow, and booking management
- **Services**: User, Court, Booking, and BookingSlot services
- **Middlewares**: Session management, user validation, and access control
- **Formatters**: Message and booking summary formatting
- **Keyboards**: Interactive Telegram keyboards for user navigation
- **Exceptions**: Custom error handling for better user experience

### Configuration
- Environment-based configuration system
- Configurable booking time windows
- Adjustable slot sizes and duration limits
- Timezone and locale support
- Database connection management

### Development
- Hot reload development server with nodemon
- TypeScript compilation and build process
- Database migration and seeding capabilities
- Code linting and formatting
- Comprehensive documentation 