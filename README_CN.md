# 💖✨ HeartLens 🔍🫶

[🇬🇧 English](README.md) · 🇨🇳 **中文**

🤫🔐 私密、**可自托管**的对话情报工具。📥 导入或粘贴聊天记录，HeartLens 🤖 会用你自己的大模型来 📊 分析互动模式、🔮 预测一条草稿消息会被如何接收，并 📓 保存私密的随手笔记 —— 全部运行在你自己掌控的基础设施上。🏠✨

🆕 这是重构后的 v2：一个多用户的 **Next.js** 应用 🧩，带账户系统 👥、服务端的 **自带密钥（BYOK）代理** 🔑（你的 API Key 加密存储 🔒，绝不会发送到浏览器 🚫🌐）、🗄️ SQLite 存储，以及可安装到手机的 📱 PWA。

> 🛡️ **隐私模型。** 🌐 v1 完全运行在浏览器中；🆕 v2 将数据存储在 **你自己服务器的数据库** 🗄️ 里，所有模型调用都在服务端代理 🔁。🙅 除了你自己配置的大模型服务商之外，数据不会发往任何第三方。🤝💕

## 🌟 功能 🎀

- 👤 **账户**：默认仅限邀请/管理员创建（可配置）。✉️🛂
- 🔐 **BYOK，加密存储：** 每个用户独立的 `{ provider, baseURL, model, apiKey }`。🧬 密钥使用 AES-256-GCM 加密，仅在服务端代理请求时解密 🔁。
- 🔌 **服务商：** 🅰️ 支持 Anthropic 以及任何 OpenAI 兼容端点（OpenRouter、LiteLLM、本地模型等 🏡）。
- 📥 **导入：** 💬 **微信**（桌面端微信导出工具导出的 CSV · TXT · JSON）、📸 **Instagram**、🟢 **WhatsApp**、🍎 **iMessage**（TXT）、🧾 通用 **CSV**，或 ✍️ 直接 **粘贴** 文本。🪄 导入支持自动识别或手动选择来源；⏱️ 即使没有时间戳也会保留消息顺序。
- 📊🔮🧠 **分析 · 预测 · 人格画像：** 参与度评分 💯、沟通模式与话题反应 🗂️、消息预测 🔮、截图（视觉）分析 🖼️，以及一份深度 **行为人格画像** 🧬 —— 核心行为法则 📜、表达指纹（口头禅 💬、招牌 emoji 😏、回复节奏 🥁）、冲突链路 ⚔️、以及消失/重现模式 👻（灵感来自 [ex-skill](https://github.com/titanwings/ex-skill) ✨）。🏷️ 可选的手动标签（MBTI 🧩、依恋风格 🪢、特质）会优先于模型推断。
- 🗃️ **每人一个存档**，含随手笔记 📓（打字 ⌨️ 或语音 🎙️）、**用户间数据隔离** 🚧、JSON 导出/导入 🔄，以及可安装的移动端 **PWA** 📱。

## 🛠️ 技术栈 💎

⚛️ Next.js 14（App Router，TypeScript）· 🗄️ Prisma + SQLite · 🪪 `jose` 会话 · 🔒 `bcryptjs` · 🧬 AES-256-GCM · ✅ `zod`（输入校验）+ 🧪 `ajv`（模型输出校验）· 🧫 Vitest。

## 🚀 快速开始（本地）🏁

```bash
npm install                 # 📦 安装依赖
cp .env.example .env        # 🔑 然后填写下方的密钥
npm run db:migrate          # 🗄️ 创建 SQLite 数据库
npm run create-user -- --email you@example.com --password yourpassword --admin   # 👤 第一个账户
npm run dev                 # 🚀 http://localhost:3000
```

🔓 登录后，打开 **设置** ⚙️，保存你的服务商配置（Anthropic 或 OpenAI 兼容的 base URL + 模型 + 密钥）🔌。🗃️ 创建一个存档，💬 添加至少 5 条消息，然后点击 **分析** 📊✨。

### 🔑 环境变量 🌱

| 🏷️ 变量                  | ✅ 必填 | 📝 说明                                                              |
| ----------------------- | ----- | -------------------------------------------------------------------- |
| 🗄️ `DATABASE_URL`        | 是 ✔️ | SQLite 路径，例如 `file:./data/heartlens.db`（相对于 `prisma/` 目录）。 |
| 🪪 `AUTH_SECRET`         | 是 ✔️ | 会话签名密钥。`openssl rand -base64 48`。                             |
| 🔒 `APP_ENCRYPTION_KEY`  | 是 ✔️ | 用于加密 API Key 的 32 字节 base64 密钥。`openssl rand -base64 32`。   |
| 🛂 `REGISTRATION_MODE`   | 否 ➖  | `invite`（默认，账户通过脚本创建）或 `open`（开放注册）。              |

## 🐳 使用 Docker 自托管 🚢

🧰 在 `docker-compose.yml` 旁边创建一个 `.env`，填入 `AUTH_SECRET` 🪪、`APP_ENCRYPTION_KEY` 🔒，以及可选的 `REGISTRATION_MODE` 🛂，然后：

```bash
docker compose up --build -d     # 🐳 构建并启动
# 👤 在运行中的容器内创建第一个账户：
docker compose exec app npm run create-user -- --email you@example.com --password yourpassword --admin
```

💾 SQLite 数据库持久化在 `heartlens-data` 卷中。🔁 容器启动时会自动执行数据库迁移。🌐 应用监听 3000 端口。

## 👥 账户 🎟️

🛂 在默认的 `invite` 模式下，开放注册被禁用。➕ 用以下命令创建账户：

```bash
npm run create-user -- --email user@example.com --password theirpassword [--admin]   # 👤✨
```

🔓 设置 `REGISTRATION_MODE=open` 可允许在登录页自助注册。

## 📥 导入聊天记录 🗂️

| 📲 来源 | 📦 格式 | 🧭 如何获取 |
| ---- | ---- | -------- |
| 💬 微信 | CSV / TXT / JSON | 用桌面端的微信聊天导出工具导出，然后上传文件。📤 |
| 📸 Instagram | JSON | 设置 → 你的动态 → 下载你的信息，上传 message_1.json。 |
| 🟢 WhatsApp | JSON | 打开对话 → ⋮ → 更多 → 导出聊天记录，转换为 JSON 数组。 |
| 🍎 iMessage | TXT | 在 macOS 上用导出工具（如 imessage-exporter）导出，再上传。 |
| 🧾 CSV | CSV | 列名形如 sender、timestamp、text。 |
| ✍️ 粘贴 | 文本 | 直接粘贴，使用 “Me: …” / “Them: …” 或 “名字: …” 这样的行。 |

> 💡 对于没有“我是谁”信息的格式，填写“你在聊天中的名字”即可正确区分双方。😊

## 🧪 测试 ✅

```bash
npm test        # 🧫 单元测试（加密 🔐、会话 🪪、服务商适配器 🔌、解析器 🧩、大模型编排 🤖）
```

## 🔒 安全说明 🛡️

- 🔐 API Key 加密存储（AES-256-GCM），绝不返回给客户端 —— 设置页只显示打码后的值 🙈。
- 🔁 所有模型调用都通过服务端代理；浏览器永远不持有服务商密钥 🚫🔑。
- 🚧 每一次存档/消息/笔记/分析查询都限定在已登录用户范围内 👤。
- 🧂 密码使用 bcrypt 哈希；会话是放在 `httpOnly` Cookie 中的签名 JWT 🍪。

💕🌸 用心打造 —— 祝分析愉快！🔍💖🫶
