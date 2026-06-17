# 💖✨ HeartLens 🔍🫶

🇬🇧 **English** · [🇨🇳 中文](README_CN.md)

🤫🔐 Private, **self-hosted** conversation intelligence. 📥 Import or paste a chat, and HeartLens 🤖 uses your own LLM provider to 📊 analyze engagement patterns, 🔮 predict how a draft message will land, and 📓 keep private journal notes — all on infrastructure you control. 🏠✨

🆕 This is the reconstructed v2: a multi-tenant **Next.js** app 🧩 with accounts 👥, a server-side **bring-your-own-key** proxy 🔑 (your API key is encrypted at rest 🔒 and never sent to the browser 🚫🌐), 🗄️ SQLite storage, and an installable 📱 mobile PWA.

> 🛡️ **Privacy model.** 🌐 v1 ran entirely in the browser. 🆕 v2 stores data in **your own server's database** 🗄️ and proxies all model calls server-side 🔁. 🙅 Nothing goes to a third party other than the LLM provider you configure. 🤝💕

## 🌟 Features 🎀

- 👤 **Accounts** with invite/admin-only registration (configurable). ✉️🛂
- 🔐 **BYOK, encrypted:** per-user `{ provider, baseURL, model, apiKey }`. 🧬 The key is encrypted with AES-256-GCM and only decrypted server-side when proxying a request. 🔁
- 🔌 **Providers:** 🅰️ Anthropic and any OpenAI-compatible endpoint (OpenRouter, LiteLLM, local… 🏡).
- 📥 **Imports:** 💬 **WeChat** (CSV · TXT · JSON export), 📸 **Instagram**, 🟢 **WhatsApp**, 🍎 **iMessage** (TXT), 🧾 generic **CSV**, or ✍️ **paste** text. 🪄 Imports auto-detect or pick a source; ⏱️ order is preserved even without timestamps.
- 📊🔮🧠 **Analyze · Predict · Persona:** engagement score 💯, patterns and topic reactions 🗂️, message prediction 🔮, screenshot (vision) analysis 🖼️, plus a deep **behavioral persona** 🧬 — core rules 📜, expression fingerprint (catchphrases 💬, signature emoji 😏, reply rhythm 🥁), conflict chains ⚔️, and disappearing/reappearing patterns 👻 (inspired by [ex-skill](https://github.com/titanwings/ex-skill) ✨). 🏷️ Optional manual tags (MBTI 🧩, attachment style 🪢, traits) are prioritised over inference.
- 🗃️ **Archives** per person with journal notes 📓 (typed ⌨️ or voice 🎙️), **per-user isolation** 🚧, JSON export/import 🔄, and an installable **PWA** 📱 with a mobile layout.

## 🛠️ Tech 💎

⚛️ Next.js 14 (App Router, TypeScript) · 🗄️ Prisma + SQLite · 🪪 `jose` sessions · 🔒 `bcryptjs` · 🧬 AES-256-GCM · ✅ `zod` (input) + 🧪 `ajv` (model-output validation) · 🧫 Vitest.

## 🚀 Quick start (local) 🏁

```bash
npm install                 # 📦 grab dependencies
cp .env.example .env        # 🔑 then edit the secrets (see below)
npm run db:migrate          # 🗄️ create the SQLite database
npm run create-user -- --email you@example.com --password yourpassword --admin   # 👤 first account
npm run dev                 # 🚀 http://localhost:3000
```

🔓 Sign in, open **Settings** ⚙️, and save your provider config (Anthropic or OpenAI-compatible base URL + model + key) 🔌. 🗃️ Create an archive, 💬 add at least 5 messages, then **Analyze** 📊✨.

### 🔑 Environment variables 🌱

| 🏷️ Variable             | ✅ Required | 📝 Description                                                         |
| ----------------------- | ---------- | --------------------------------------------------------------------- |
| 🗄️ `DATABASE_URL`        | yes ✔️     | SQLite path, e.g. `file:./data/heartlens.db` (relative to `prisma/`). |
| 🪪 `AUTH_SECRET`         | yes ✔️     | Session signing secret. `openssl rand -base64 48`.                    |
| 🔒 `APP_ENCRYPTION_KEY`  | yes ✔️     | 32-byte base64 key for API-key encryption. `openssl rand -base64 32`. |
| 🛂 `REGISTRATION_MODE`   | no ➖       | `invite` (default; accounts via script) or `open` (public signup).    |

## 🐳 Self-host with Docker 🚢

🧰 Create a `.env` next to `docker-compose.yml` with `AUTH_SECRET` 🪪, `APP_ENCRYPTION_KEY` 🔒, and optionally `REGISTRATION_MODE` 🛂, then:

```bash
docker compose up --build -d     # 🐳 build & launch
# 👤 create the first account inside the running container:
docker compose exec app npm run create-user -- --email you@example.com --password yourpassword --admin
```

💾 The SQLite database persists in the `heartlens-data` volume. 🔁 Migrations run automatically on boot. 🌐 The app listens on port 3000.

## 👥 Accounts 🎟️

🛂 In the default `invite` mode, public signup is disabled. ➕ Create accounts with:

```bash
npm run create-user -- --email user@example.com --password theirpassword [--admin]   # 👤✨
```

🔓 Set `REGISTRATION_MODE=open` to allow self-service signup from the login screen.

## 🧪 Tests ✅

```bash
npm test        # 🧫 unit tests (crypto 🔐, sessions 🪪, provider adapters 🔌, LLM orchestration 🤖)
```

## 🔒 Security notes 🛡️

- 🔐 API keys are encrypted at rest (AES-256-GCM) and never returned to the client — Settings shows only a masked value 🙈.
- 🔁 All model calls are proxied through the server; the browser never holds a provider key 🚫🔑.
- 🚧 Every archive/message/journal/analysis query is scoped to the authenticated user 👤.
- 🧂 Passwords are hashed with bcrypt; sessions are signed JWTs in `httpOnly` cookies 🍪.

💕🌸 Made with care — happy analyzing! 🔍💖🫶
