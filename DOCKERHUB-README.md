# Court Booking Telegram Bot

A modern Telegram bot for booking sports courts and facilities. Built with TypeScript, Telegraf, and Prisma ORM.

## 🏀 Features

- **Interactive Court Booking**: Browse available courts and book time slots
- **Smart Time Management**: Configurable booking windows and slot durations
- **User Management**: Automatic user registration and access control
- **Booking History**: View past and upcoming bookings
- **Multi-language Support**: Built-in internationalization
- **Real-time Availability**: Check court availability in real-time
- **Notifications**: Receive notifications about upcoming bookings

## 🚀 Quick Start

### Using Docker Run

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

### Using Docker Compose

```yaml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: courtbot
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data

  bot:
    image: artemind/court-booking-tg-bot:latest
    environment:
      BOT_TOKEN: "your_telegram_bot_token"
      DATABASE_HOST: "postgres"
      DATABASE_PORT: "5432"
      DATABASE_NAME: "courtbot"
      DATABASE_USER: "postgres"
      DATABASE_PASSWORD: "password"
      APP_LOCALE: "en"
      APP_TIMEZONE: "UTC"
    depends_on:
      - postgres

volumes:
  postgres_data:
```

## 📋 Prerequisites

- Telegram Bot Token (get it from [@BotFather](https://t.me/BotFather))
- PostgreSQL database (you can use Docker as shown above)

## 🔧 Configuration

### Required Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `BOT_TOKEN` | Telegram bot token from BotFather | `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz` |
| `DATABASE_HOST` | PostgreSQL host | `postgres` |
| `DATABASE_PORT` | PostgreSQL port | `5432` |
| `DATABASE_NAME` | Database name | `courtbot` |
| `DATABASE_USER` | Database user | `postgres` |
| `DATABASE_PASSWORD` | Database password | `password` |

### Optional Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_LOCALE` | Application locale | `en` |
| `APP_TIMEZONE` | Application timezone | `UTC` |
| `BOOKING_AVAILABLE_FROM_TIME` | Booking start time | `07:00` |
| `BOOKING_AVAILABLE_TO_TIME` | Booking end time | `23:59` |
| `BOOKING_SLOT_SIZE_IN_MINUTES` | Time slot size | `30` |
| `BOOKING_MIN_DURATION_MINUTES` | Minimum booking duration | `30` |
| `BOOKING_MAX_DURATION_MINUTES` | Maximum booking duration | `180` |

## 🏗️ How It Works

The container automatically:
1. Constructs the `DATABASE_URL` from the provided environment variables
2. Applies Prisma migrations to set up the database schema
3. Starts the Telegram bot

**Important**: Ensure your PostgreSQL database is running and accessible before starting the bot container.

For production use, we recommend using specific version tags instead of `latest` for reproducible deployments.

## 📖 Documentation

For detailed documentation, configuration options, and development instructions, visit the [GitHub repository](https://github.com/artemind/court-booking-tg-bot).

## 🤝 Support

- **Issues**: [GitHub Issues](https://github.com/artemind/court-booking-tg-bot/issues)
- **Source Code**: [GitHub Repository](https://github.com/artemind/court-booking-tg-bot)

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Artem Yeremenko**

- Website: [artemind.dev](https://artemind.dev/?utm_source=dockerhub&utm_medium=court-booking-tg-bot&utm_campaign=personal_brand)
- GitHub: [@artemind](https://github.com/artemind)
