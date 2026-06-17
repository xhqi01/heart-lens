# HeartLens — Conversation Intelligence

> Read between the lines.

**[English](#english) · [中文](README_CN.md)**

---

<a name="english"></a>

HeartLens is a private, self-hosted conversation intelligence tool. Import or paste a chat, and HeartLens uses your own LLM provider to analyze engagement patterns, predict how a draft message will land, and keep private journal notes — all on infrastructure you control.

This is v2: a multi-tenant Next.js app with accounts, a server-side bring-your-own-key proxy (your API key is encrypted at rest and never sent to the browser), SQLite storage, and an installable mobile PWA.

> **Privacy model.** v1 ran entirely in the browser. v2 stores data in your own server's database and proxies all model calls server-side. Nothing goes to a third party other than the LLM provider you configure.

## Features

| Feature | Description |
|---------|-------------|
| **Accounts** | Invite or admin-only registration (configurable) |
| **BYOK, encrypted** | Per-user provider config — key encrypted with AES-256-GCM, only decrypted server-side |
| **Providers** | Anthropic and any OpenAI-compatible endpoint (OpenRouter, LiteLLM, local) |
| **Imports** | WeChat (CSV · TXT · JSON), Instagram, WhatsApp, iMessage (TXT), generic CSV, or paste text. Auto-detects source; order preserved even without timestamps |
| **Analyze · Predict · Persona** | Engagement level, patterns and topic reactions, message prediction, screenshot analysis, plus a deep behavioral persona — core rules, expression fingerprint, conflict chains, disappearing/reappearing patterns |
| **Archives** | Per person, with journal notes (typed or voice), per-user isolation, JSON export/import, and an installable PWA with mobile layout |

## Tech Stack

Next.js 14 (App Router, TypeScript) · Prisma + SQLite · `jose` sessions · `bcryptjs` · AES-256-GCM · `zod` (input) + `ajv` (model-output validation) · Vitest

## Quick Start (local)

```bash
npm install
cp .env.example .env        # edit the secrets (see below)
npm run db:migrate
npm run create-user -- --email you@example.com --password yourpassword --admin
npm run dev                 # http://localhost:3000
```

Sign in, open Settings, and save your provider config (Anthropic or OpenAI-compatible base URL + model + key). Create an archive, add at least 5 messages, then Analyze.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | yes | SQLite path, e.g. `file:./data/heartlens.db` |
| `AUTH_SECRET` | yes | Session signing secret. `openssl rand -base64 48` |
| `APP_ENCRYPTION_KEY` | yes | 32-byte base64 key for API-key encryption. `openssl rand -base64 32` |
| `REGISTRATION_MODE` | no | `invite` (default) or `open` (public signup) |

## Self-host with Docker

Create a `.env` next to `docker-compose.yml` with `AUTH_SECRET`, `APP_ENCRYPTION_KEY`, and optionally `REGISTRATION_MODE`, then:

```bash
docker compose up --build -d
docker compose exec app npm run create-user -- --email you@example.com --password yourpassword --admin
```

The SQLite database persists in the `heartlens-data` volume. Migrations run automatically on boot. The app listens on port 3000.

## Accounts

In the default `invite` mode, public signup is disabled. Create accounts with:

```bash
npm run create-user -- --email user@example.com --password theirpassword [--admin]
```

Set `REGISTRATION_MODE=open` to allow self-service signup from the login screen.

## Tests

```bash
npm test
```

## Security Notes

- API keys are encrypted at rest (AES-256-GCM) and never returned to the client — Settings shows only a masked value.
- All model calls are proxied through the server; the browser never holds a provider key.
- Every archive/message/journal/analysis query is scoped to the authenticated user.
- Passwords are hashed with bcrypt; sessions are signed JWTs in `httpOnly` cookies.

## Cost

HeartLens uses your own API key. Typical costs with `claude-sonnet-4-6`:
- Full conversation analysis: ~$0.003–0.008
- Response prediction: ~$0.002–0.005
- Screenshot analysis: ~$0.003–0.006

---

## License

MIT © 2024

*Built with ♡ using Next.js + Claude API*
