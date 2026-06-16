# 💗 HeartLens — Conversation Intelligence

> Read between the lines. / 行間を読む。

**[English](#english) · [日本語](#japanese)**

---

<a name="english"></a>
## English

HeartLens is a **privacy-first, AI-powered conversation analysis tool** that runs entirely in your browser. Upload your chat exports, analyze communication patterns, and predict how your messages might land — without your data ever leaving your device.

### ✨ Features

| Feature | Description |
|---------|-------------|
| 📂 **Multiple Archives** | Keep separate analysis spaces for different people |
| 📱 **Chat Import** | Import Instagram & WhatsApp JSON exports |
| ✍️ **Manual Entry** | Add messages by hand for quick one-off analyses |
| 🖼 **Screenshot Analysis** | Drop a conversation screenshot for instant insights |
| ◈ **Pattern Analysis** | Engagement scores, topic reactions, communication style, attachment signals |
| ⚡ **Response Predictor** | Draft a message, get a prediction + improved alternatives |
| 🔒 **100% Local** | All data in IndexedDB. Zero backend. Your conversations stay yours. |

### 🚀 Quick Start

**Prerequisites:** Node.js 18+, an [Anthropic API key](https://console.anthropic.com)

```bash
git clone https://github.com/YOUR_USERNAME/heart-lens
cd heart-lens
npm install
npm start
```

Open `http://localhost:3000`, go to ⚙ Settings, enter your API key.

### 💰 Cost

HeartLens uses `claude-sonnet-4-6`. Typical costs:
- Full conversation analysis: ~$0.003–0.008
- Response prediction: ~$0.002–0.005
- Screenshot analysis: ~$0.003–0.006

### 🔒 Privacy

- All messages stored in **IndexedDB** (your browser's local storage)
- API calls go **directly** from your browser to `api.anthropic.com`
- No server, no database, no tracking
- Clear browser data to wipe everything

### 📁 File Format Support

**Instagram:** `Settings > Your activity > Download your information > Messages`
Export as JSON. Upload `messages_1.json`.

**WhatsApp:** Open chat > `⋮` > More > Export chat (without media). Upload the `.json` file.

### 🛠 Tech Stack

- React 18 · IndexedDB · Anthropic Claude API
- IBM Plex Sans + IBM Plex Mono
- Zero external dependencies beyond React + Recharts

### ⚠️ Disclaimer

HeartLens is an analysis aid, not a relationship oracle. Predictions are pattern-based estimates, not guarantees. Use your own judgment.

---

<a name="japanese"></a>
## 日本語

HeartLens（ハートレンズ）は、**プライバシー優先のAI会話分析ツール**です。すべてブラウザ上で動作し、データが外部サーバーに送信されることは一切ありません。チャット履歴をアップロードしてパターンを分析し、送ろうとしているメッセージへの反応を予測できます。

### ✨ 主な機能

| 機能 | 説明 |
|------|------|
| 📂 **複数アーカイブ** | 相手ごとに分析スペースを分けて管理 |
| 📱 **チャットインポート** | Instagram・WhatsAppのJSONエクスポートに対応 |
| ✍️ **手動入力** | メッセージを手入力して分析 |
| 🖼 **スクリーンショット分析** | 会話の画像をドロップしてすぐに解析 |
| ◈ **パターン分析** | エンゲージメントスコア・トピック別反応・コミュニケーションスタイル・愛着スタイルの分析 |
| ⚡ **返信予測** | 送ろうとしているメッセージの反応を予測＋改善案を提示 |
| 🔒 **完全ローカル** | データはIndexedDBに保存。バックエンドサーバーなし。 |

### 🚀 使い方

**必要なもの：** Node.js 18以上、[Anthropic APIキー](https://console.anthropic.com)

```bash
git clone https://github.com/YOUR_USERNAME/heart-lens
cd heart-lens
npm install
npm start
```

`http://localhost:3000` を開き、⚙ 設定からAPIキーを入力してください。

### 💰 利用コスト

`claude-sonnet-4-6` モデルを使用しています。目安：
- 会話分析1回：約$0.003〜$0.008（約0.5〜1.2円）
- 返信予測1回：約$0.002〜$0.005
- スクリーンショット分析：約$0.003〜$0.006

### 🔒 プライバシーについて

- すべてのメッセージは **IndexedDB**（ブラウザのローカルストレージ）に保存
- APIコールはブラウザから **直接** `api.anthropic.com` に送信
- 中間サーバーなし・データ収集なし・トラッキングなし
- ブラウザのデータを消去すれば完全に削除されます

### 📁 対応ファイル形式

**Instagram：** 設定 > あなたのアクティビティ > 情報のダウンロード > メッセージ
JSON形式でエクスポートし、`messages_1.json` をアップロード。

**WhatsApp：** チャットを開く > `⋮` > その他 > チャットをエクスポート（メディアなし）
`.json` ファイルをアップロード。

### ⚠️ 免責事項

HeartLens は分析の補助ツールです。予測はパターンに基づく推定であり、保証ではありません。最終的な判断はご自身でお願いします。

---

## License

MIT © 2024

---

*Built with ♡ using React + Claude API*
