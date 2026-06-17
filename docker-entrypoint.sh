#!/bin/sh
set -e

echo "→ Applying database migrations..."
npx prisma migrate deploy

echo "→ Starting HeartLens on port ${PORT:-3000}..."
exec npm run start
