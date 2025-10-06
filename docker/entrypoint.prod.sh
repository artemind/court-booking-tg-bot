#!/usr/bin/env sh
set -e

# Build DATABASE_URL from parts if not provided
: "${DATABASE_HOST:=db}"
: "${DATABASE_PORT:=5432}"
: "${DATABASE_NAME:=courtbot}"
: "${DATABASE_USER:=postgres}"
: "${DATABASE_PASSWORD:=postgres}"

if [ -z "${DATABASE_URL}" ]; then
  export DATABASE_URL="postgresql://${DATABASE_USER}:${DATABASE_PASSWORD}@${DATABASE_HOST}:${DATABASE_PORT}/${DATABASE_NAME}?schema=public"
fi

# Apply migrations only; client is generated at build time
npx prisma migrate deploy

exec node dist/app.js




