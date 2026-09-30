.PHONY: start stop prod

# Development met hot reload
start:
	docker compose -f compose.dev.yml up --build

stop:
	docker compose -f compose.dev.yml down

# Productie (Raspberry Pi), draait op de achtergrond
prod:
	docker compose up -d --build
