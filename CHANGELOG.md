# Changelog

All notable changes to this project will be documented in this file.

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