# Court Booking Telegram Bot

A modern Telegram bot for booking sports courts and facilities. Built with TypeScript, Telegraf, and Prisma ORM.

## 🏀 Features

- **Interactive Court Booking**: Users can browse available courts and book time slots
- **Smart Time Management**: Configurable booking windows and slot durations
- **User Management**: Automatic user registration and access control
- **Booking History**: Users can view their past and upcoming bookings
- **Multi-language Support**: Built-in internationalization support
- **Real-time Availability**: Check court availability in real-time
- **Notifications:**: Receive notifications about upcoming bookings

## 🏗️ Architecture

The bot follows a modular architecture with clear separation of concerns:

- **Handlers**: Telegram command and callback handlers
- **Services**: Business logic layer
- **Middlewares**: Request processing and validation
- **Formatters**: Message formatting utilities
- **Exceptions**: Custom error handling

## 🗄️ Database Schema

### Users
- Telegram ID and username tracking
- Access control and restrictions
- Booking history
- Notification Preferences

### Courts
- Court information and availability
- Configurable booking rules

### Bookings
- Time slot reservations
- User and court relationships
- Booking status tracking

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/artemind/court-booking-tg-bot.git
   cd court-booking-tg-bot
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Install dependencies**
   ```bash
   docker-compose run --rm node npm install
   ```

4. **Set up the database**
   ```bash
   npm run db:setup
   ```

5. **Start the development server**
   ```bash
   docker-compose run --rm node npm run dev
   ```

## 📋 Prerequisites

- Node.js 24+ 
- PostgreSQL database
- Telegram Bot Token (from @BotFather)

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram bot token | Required |
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `APP_LOCALE` | Application locale | `en` |
| `APP_TIMEZONE` | Application timezone | `UTC` |
| `BOOKING_AVAILABLE_FROM_TIME` | Booking start time | `07:00` |
| `BOOKING_AVAILABLE_TO_TIME` | Booking end time | `23:59` |
| `BOOKING_SLOT_SIZE_IN_MINUTES` | Time slot size | `30` |
| `BOOKING_MIN_DURATION_MINUTES` | Minimum booking duration | `30` |
| `BOOKING_MAX_DURATION_MINUTES` | Maximum booking duration | `180` |

## 🛠️ Development

### Available Scripts

```bash
npm run dev          # Start development server with hot reload
npm run build        # Build the project
npm run start        # Start production server
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint issues
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## 📋 Changelog

See [CHANGELOG.md](CHANGELOG.md) for a list of changes and version history.

## ▶️ Run from Docker Hub

Run the published image directly (the entrypoint assembles DATABASE_URL from parts):

```bash
docker run -d \
  --name courtbot \
  -e BOT_TOKEN="your_telegram_bot_token" \
  -e DATABASE_HOST="postgres" \
  -e DATABASE_PORT="5432" \
  -e DATABASE_NAME="courtbot" \
  -e DATABASE_USER="postgres" \
  -e DATABASE_PASSWORD="password" \
  -e APP_LOCALE="en" \
  -e APP_TIMEZONE="UTC" \
  artemind/court-booking-tg-bot:latest
```

Notes:
- The container applies Prisma migrations on startup; ensure the database is reachable.
- Override `:latest` with a specific tag (e.g., `:v1.0.0`) for reproducible deployments.

## 👨‍💻 Author

**Artem Yeremenko**

- Website: [artemind.dev](https://artemind.dev/?utm_source=github&utm_medium=repo_court-booking-tg-bot&utm_campaign=personal_brand)
- GitHub: [@artemind](https://github.com/artemind)