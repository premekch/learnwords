.PHONY: dev dev-build stop logs migrate-dev migrate-prod setup-ssl renew-ssl prod prod-build

# ── Development ──────────────────────────────────────────────────────────────

dev:
	docker-compose up

dev-build:
	docker-compose up --build

stop:
	docker-compose down

logs:
	docker-compose logs -f

# Run this ONCE on first launch to create the DB schema
migrate-dev:
	docker-compose run --rm backend npx prisma migrate dev --name init

# Open Prisma Studio (DB browser)
studio:
	docker-compose run --rm -p 5555:5555 backend npx prisma studio

# ── Production (Hetzner) ──────────────────────────────────────────────────────
# Copy .env.example to .env and fill in values before running these.

prod:
	docker-compose -f docker-compose.prod.yml --env-file .env up -d

prod-build:
	docker-compose -f docker-compose.prod.yml --env-file .env up -d --build

prod-stop:
	docker-compose -f docker-compose.prod.yml down

prod-logs:
	docker-compose -f docker-compose.prod.yml logs -f

prod-migrate:
	docker-compose -f docker-compose.prod.yml --env-file .env run --rm backend npx prisma migrate deploy

# Issue SSL certificate (run once, replace yourdomain.com and your@email.com)
setup-ssl:
	@read -p "Domain (e.g. learnwords.example.com): " domain; \
	read -p "Email for Let's Encrypt: " email; \
	docker-compose -f docker-compose.prod.yml --env-file .env run --rm certbot \
		certonly --webroot --webroot-path=/var/www/certbot \
		--email $$email --agree-tos --no-eff-email -d $$domain

renew-ssl:
	docker-compose -f docker-compose.prod.yml --env-file .env run --rm certbot renew
