#!/bin/sh
set -e

echo "⏳ Syncing database schema..."

# prisma db push is safe for non-interactive Docker environments.
# It creates/updates tables without needing migration files.
# For production with migration history, replace with: npx prisma migrate deploy
# (and run `make migrate-dev` once locally first to generate migration files).
npx prisma db push --skip-generate

echo "✅ Database ready."
exec "$@"
