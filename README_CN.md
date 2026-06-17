# HeartLens — 对话智能分析工具

> 读懂字里行间。

**[English](README.md) · 中文**

---

HeartLens 是一个私有、自托管的对话智能分析工具。导入或粘贴聊天记录，HeartLens 使用你自己的 LLM 服务分析互动模式、预测消息效果、记录私人日记——所有数据都在你自己控制的服务器上。

这是 v2 版本：基于 Next.js 的多用户应用，支持账户系统、服务端 BYOK 代理（API Key 加密存储，永不发送至浏览器）、SQLite 数据库，以及可安装的移动端 PWA。

> **隐私说明。** v1 完全在浏览器本地运行。v2 将数据存储在你自己的服务器数据库中，所有模型调用通过服务端代理。除你配置的 LLM 服务商外，数据不会发送给任何第三方。

## 功能

| 功能 | 说明 |
|------|------|
| **账户系统** | 支持邀请制或管理员注册（可配置） |
| **BYOK 加密** | 每用户独立的服务商配置，API Key 使用 AES-256-GCM 加密，仅在服务端解密 |
| **支持多种服务商** | Anthropic 及任何兼容 OpenAI 接口的服务（OpenRouter、LiteLLM、本地部署等） |
| **导入格式** | 微信（CSV · TXT · JSON）、Instagram、WhatsApp、iMessage（TXT）、通用 CSV，或直接粘贴文本。自动识别来源，即使没有时间戳也能保留顺序 |
| **分析 · 预测 · 人格画像** | 参与度评级、模式与话题反应分析、消息预测、截图分析，以及深度行为人格画像——核心规律、表达指纹、冲突链、消失/复现模式 |
| **存档管理** | 每人独立存档，支持日记（文字或语音）、用户数据隔离、JSON 导入导出，以及可安装的移动端 PWA |

## 技术栈

Next.js 14 (App Router, TypeScript) · Prisma + SQLite · `jose` 会话管理 · `bcryptjs` · AES-256-GCM · `zod`（输入校验）+ `ajv`（模型输出校验）· Vitest

## 快速开始（本地运行）

```bash
npm install
cp .env.example .env        # 编辑环境变量（见下表）
npm run db:migrate
npm run create-user -- --email you@example.com --password yourpassword --admin
npm run dev                 # http://localhost:3000
```

登录后，进入 Settings 填写服务商配置（Anthropic 或兼容 OpenAI 的接口地址 + 模型 + API Key）。创建存档，添加至少 5 条消息，点击 Analyze。

### 环境变量

| 变量名 | 是否必填 | 说明 |
|--------|----------|------|
| `DATABASE_URL` | 是 | SQLite 路径，例如 `file:./data/heartlens.db` |
| `AUTH_SECRET` | 是 | 会话签名密钥。`openssl rand -base64 48` |
| `APP_ENCRYPTION_KEY` | 是 | API Key 加密用的 32 字节 base64 密钥。`openssl rand -base64 32` |
| `REGISTRATION_MODE` | 否 | `invite`（默认，邀请制）或 `open`（开放注册） |

## Docker 自托管

在 `docker-compose.yml` 同级目录创建 `.env` 文件，填写 `AUTH_SECRET`、`APP_ENCRYPTION_KEY`，以及可选的 `REGISTRATION_MODE`，然后：

```bash
docker compose up --build -d
docker compose exec app npm run create-user -- --email you@example.com --password yourpassword --admin
```

SQLite 数据库持久化在 `heartlens-data` volume 中。启动时自动执行迁移。应用监听 3000 端口。

## 账户管理

默认 `invite` 模式下，关闭公开注册。使用以下命令创建账户：

```bash
npm run create-user -- --email user@example.com --password theirpassword [--admin]
```

设置 `REGISTRATION_MODE=open` 允许用户在登录页自助注册。

## 测试

```bash
npm test
```

## 安全说明

- API Key 加密存储（AES-256-GCM），永不返回给客户端——Settings 页面只显示脱敏值。
- 所有模型调用通过服务端代理，浏览器端不持有任何服务商密钥。
- 所有存档、消息、日记、分析查询均限定在已认证用户范围内。
- 密码使用 bcrypt 哈希；会话使用签名 JWT 存储在 `httpOnly` Cookie 中。

## 费用估算

HeartLens 使用你自己的 API Key。以 `claude-sonnet-4-6` 为例：
- 完整对话分析：约 $0.003–0.008（约 0.5–1.2 元）
- 回复预测：约 $0.002–0.005
- 截图分析：约 $0.003–0.006

---

## License

MIT © 2024

*Built with ♡ using Next.js + Claude API*
