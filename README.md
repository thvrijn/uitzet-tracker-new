# uitzet-tracker-new

## Draaien met Docker

Maak eerst een `.env` op basis van `.env.example` en vul de Supabase-waarden in.
Optioneel: `PORT=...` in `.env` om de poort op die computer te wijzigen.

**Development** (hot reload, standaard http://localhost:5173):

```sh
make start   # stoppen: Ctrl+C of make stop
```

**Productie** (nginx, standaard http://<host>:8080):

```sh
make prod
```

De Supabase-waarden worden bij het bouwen in de app gezet: na een wijziging in `.env` opnieuw bouwen met `--build`.
Na een wijziging in `package.json` de dev-container vernieuwen met `docker compose -f compose.dev.yml up --build -V`.
