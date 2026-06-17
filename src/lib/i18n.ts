// HeartLens i18n — ported from heart-lens/src/utils/i18n.js.
// getT() merges the requested language over English so any missing key falls back to English.

export interface LanguageMeta {
  code: string;
  name: string;
  speechCode: string;
  flag: string;
  rtl?: boolean;
}

export const LANGUAGES: LanguageMeta[] = [
  { code: 'en', name: 'English', speechCode: 'en-US', flag: '🇺🇸' },
  { code: 'zh', name: '中文', speechCode: 'zh-CN', flag: '🇨🇳' },
  { code: 'ja', name: '日本語', speechCode: 'ja-JP', flag: '🇯🇵' },
  { code: 'es', name: 'Español', speechCode: 'es-ES', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', speechCode: 'fr-FR', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', speechCode: 'de-DE', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', speechCode: 'pt-BR', flag: '🇧🇷' },
  { code: 'ko', name: '한국어', speechCode: 'ko-KR', flag: '🇰🇷' },
  { code: 'it', name: 'Italiano', speechCode: 'it-IT', flag: '🇮🇹' },
  { code: 'ru', name: 'Русский', speechCode: 'ru-RU', flag: '🇷🇺' },
  { code: 'ar', name: 'العربية', speechCode: 'ar-SA', flag: '🇸🇦', rtl: true },
  { code: 'hi', name: 'हिन्दी', speechCode: 'hi-IN', flag: '🇮🇳' },
  { code: 'tr', name: 'Türkçe', speechCode: 'tr-TR', flag: '🇹🇷' },
  { code: 'nl', name: 'Nederlands', speechCode: 'nl-NL', flag: '🇳🇱' },
  { code: 'pl', name: 'Polski', speechCode: 'pl-PL', flag: '🇵🇱' },
  { code: 'vi', name: 'Tiếng Việt', speechCode: 'vi-VN', flag: '🇻🇳' },
  { code: 'th', name: 'ภาษาไทย', speechCode: 'th-TH', flag: '🇹🇭' },
  { code: 'id', name: 'Bahasa Indonesia', speechCode: 'id-ID', flag: '🇮🇩' },
];

export type TierKey = 'vhigh' | 'high' | 'moderate' | 'low';
export type ConfKey = 'vlikely' | 'likely' | 'uncertain' | 'unlikely';

export const TIERS: Record<TierKey, { label: string; labelZh: string; labelJa: string; color: string; bg: string; dot: string }> = {
  vhigh: { label: 'Very High', labelZh: '非常高', labelJa: 'とても高い', color: '#2a9d78', bg: 'rgba(42,157,120,0.09)', dot: '🟢' },
  high: { label: 'High', labelZh: '高', labelJa: '高い', color: '#2a9d78', bg: 'rgba(42,157,120,0.09)', dot: '🟢' },
  moderate: { label: 'Moderate', labelZh: '一般', labelJa: '普通', color: '#c97d2a', bg: 'rgba(201,125,42,0.09)', dot: '🟡' },
  low: { label: 'Low', labelZh: '低', labelJa: '低い', color: '#d94f6e', bg: 'rgba(217,79,110,0.09)', dot: '🔴' },
};

export const CONFIDENCE: Record<ConfKey, { label: string; labelZh: string; labelJa: string; color: string; barPct: number }> = {
  vlikely: { label: 'Very likely', labelZh: '很可能', labelJa: 'かなり高い', color: '#2a9d78', barPct: 90 },
  likely: { label: 'Likely', labelZh: '可能', labelJa: '高め', color: '#2a9d78', barPct: 70 },
  uncertain: { label: 'Uncertain', labelZh: '不确定', labelJa: '不明', color: '#c97d2a', barPct: 45 },
  unlikely: { label: 'Unlikely', labelZh: '不太可能', labelJa: '低め', color: '#d94f6e', barPct: 22 },
};

export function scoreToTier(n: number): TierKey {
  if (n >= 80) return 'vhigh';
  if (n >= 60) return 'high';
  if (n >= 40) return 'moderate';
  return 'low';
}

export function likelihoodToConf(n: number): ConfKey {
  if (n >= 75) return 'vlikely';
  if (n >= 55) return 'likely';
  if (n >= 35) return 'uncertain';
  return 'unlikely';
}

export function getTierLabel(tierKey: TierKey, lang: string): string {
  const t = TIERS[tierKey];
  if (!t) return '';
  if (lang === 'zh') return t.labelZh;
  if (lang === 'ja') return t.labelJa;
  return t.label;
}

export function getConfLabel(confKey: ConfKey, lang: string): string {
  const c = CONFIDENCE[confKey];
  if (!c) return '';
  if (lang === 'zh') return c.labelZh;
  if (lang === 'ja') return c.labelJa;
  return c.label;
}

type Dict = Record<string, string>;

const en: Dict = {
  appName: 'HeartLens',
  newArchive: '+ New Archive',
  apiConnected: 'Provider set',
  noApiKey: 'No provider',
  settings: '⚙ Settings',
  signOut: 'Sign out',
  analyze: '◈ Analyze',
  analyzing: '⟳ Analyzing...',
  tabMessages: '💬 Messages',
  tabJournal: '📓 Journal',
  tabAnalysis: '◈ Analysis',
  tabPredict: '⚡ Predict',
  tabImage: '🖼 Screenshot',
  importTitle: 'Import chat history',
  addMessage: 'Add a message manually...',
  add: 'Add',
  newEntry: 'New Entry',
  journalPlaceholder: 'What happened? How did it feel? Any details you want to remember...',
  tagsPlaceholder: 'tags: plans, positive, uncertain...',
  voiceNote: '🎙 Voice note',
  tapStop: 'tap to stop',
  transcribing: 'transcribing...',
  saveEntry: 'Save entry',
  journalDesc:
    'Write or speak what happened — in-person moments, gut feelings, details that felt off or surprisingly good. These notes are used as context when HeartLens analyzes your conversations.',
  engScore: 'Engagement Level',
  stats: 'Message Stats',
  total: 'total',
  fromYou: 'from you',
  fromThem: 'from them',
  avgWords: 'avg words',
  greenFlags: '✓ Green Flags',
  watchOut: '⚠ Watch Out',
  topicReactions: 'Topic Reactions',
  commStyle: 'Communication Style',
  keyInsights: 'Key Insights',
  patterns: 'Patterns',
  predictTitle: 'Message Predictor',
  predictDesc:
    "Draft what you're thinking about sending. HeartLens predicts the response based on their patterns.",
  predictBtn: '⚡ Predict Response',
  likelyResponse: 'Likely Response',
  why: 'Why',
  alternatives: 'Alternative Versions',
  timing: 'Timing',
  risks: 'Potential Risks',
  advice: 'Advice',
  dropScreenshot: 'Drop a conversation screenshot here or click to upload',
  chooseFile: 'Choose file',
  archiveNameLabel: 'Their name / nickname *',
  archiveNamePlaceholder: 'e.g. Alex, my crush...',
  yourNameLabel: 'Your name (for import matching)',
  yourNamePlaceholder: 'Your username in the chat',
  contextLabel: 'Context note (optional)',
  contextPlaceholder: "How do you know them? What's the situation?",
  cancel: 'Cancel',
  createArchive: 'Create Archive',
  newArchiveTitle: 'New Archive',
  newArchiveSub: 'Create a separate space to analyze conversations with one person.',
  settingsTitle: 'Settings',
  settingsSub:
    'Configure your model provider. Your API key is encrypted on the server and never sent back to the browser.',
  apiKeyLabel: 'API Key',
  apiKeyPlaceholder: 'Leave blank to keep the current key',
  providerLabel: 'Provider',
  providerAnthropic: 'Anthropic',
  providerOpenAI: 'OpenAI-compatible',
  baseUrlLabel: 'Base URL',
  modelLabel: 'Model',
  languageLabel: 'Language',
  uiLanguage: 'Interface & AI response language',
  privacyNote:
    '🔒 Self-hosted. Your archives live in your own server\'s database and your API key is encrypted at rest. All model calls are proxied server-side — your key never reaches the browser.',
  saveKey: 'Save',
  saved: '✓ Saved',
  msgs: 'msgs',
  deleteConfirm: 'Delete archive "{name}" and all its data?',
  runAnalysis: 'Run Analysis',
  addMoreMessages: 'Add at least 5 messages before analyzing.',
  noAnalysisYet: 'Click "Analyze" to generate insights from your conversation history.',
  noMessages: 'No messages yet. Import a chat file or add messages manually.',
  showingLast: 'Showing last 100 of {n} messages',
  me: 'ME',
  them: 'THEM',
  exampleOutput: 'Example output',
  importHint:
    'Instagram: Settings → Your activity → Download your information\nWhatsApp: Open chat → ⋮ → More → Export chat',
  exportArchive: 'Export',
  importArchive: 'Import',
  // Auth
  signIn: 'Sign in',
  signingIn: 'Signing in...',
  emailLabel: 'Email',
  passwordLabel: 'Password',
  loginTitle: 'HeartLens',
  loginSub: 'Sign in to your account.',
  loginError: 'Invalid email or password.',
  // Imports
  importSource: 'Import from',
  pasteTitle: 'Paste conversation',
  pasteHint: 'Paste your chat. Use lines like "Me: ..." and "Them: ...", or "Name: ...".',
  doImport: 'Import',
  // Persona + manual tags
  personaTitle: '🧬 Persona',
  coreRules: 'Core behavioral rules',
  expressionStyle: 'Expression style',
  catchphrases: 'Catchphrases',
  highFrequencyWords: 'Frequent words',
  signatureEmoji: 'Signature emoji',
  replyRhythm: 'Reply rhythm',
  disengagementSignals: 'Going-quiet signals',
  sentenceStyle: 'Sentence style',
  emotionalPatterns: 'Emotional patterns',
  conflictPattern: 'Conflict pattern',
  relationshipRole: 'Relationship role',
  mbtiLabel: 'MBTI (optional)',
  attachmentLabel: 'Attachment style (optional)',
  traitsLabel: 'Trait tags (optional)',
  traitsPlaceholder: 'e.g. guarded, witty, needs space',
  attachmentNone: '— not set —',
};

const zh: Dict = {
  appName: 'HeartLens',
  newArchive: '+ 新建存档',
  apiConnected: '已配置',
  noApiKey: '未配置',
  settings: '⚙ 设置',
  signOut: '退出登录',
  analyze: '◈ 分析',
  analyzing: '⟳ 分析中...',
  tabMessages: '💬 消息',
  tabJournal: '📓 日记',
  tabAnalysis: '◈ 分析',
  tabPredict: '⚡ 预测',
  tabImage: '🖼 截图',
  importTitle: '导入聊天记录',
  addMessage: '手动添加一条消息...',
  add: '添加',
  newEntry: '新建记录',
  journalPlaceholder: '发生了什么？感觉怎么样？想记住的细节...',
  tagsPlaceholder: '标签：约会计划, 积极信号, 不确定...',
  voiceNote: '🎙 语音输入',
  tapStop: '点击停止',
  transcribing: '转录中...',
  saveEntry: '保存',
  journalDesc:
    '用文字或语音记录发生的事情——见面的瞬间、直觉感受、感觉奇怪或特别好的细节。这些记录会作为上下文用于分析。',
  engScore: '参与度',
  stats: '消息统计',
  total: '总计',
  fromYou: '你发的',
  fromThem: '对方发的',
  avgWords: '平均字数',
  greenFlags: '✓ 绿旗信号',
  watchOut: '⚠ 需要注意',
  topicReactions: '话题反应',
  commStyle: '沟通风格',
  keyInsights: '关键洞察',
  patterns: '模式',
  predictTitle: '消息预测',
  predictDesc: '输入你想发的消息，HeartLens 根据对方的沟通模式预测回复。',
  predictBtn: '⚡ 预测回复',
  likelyResponse: '可能的回复',
  why: '分析依据',
  alternatives: '更好的替代版本',
  timing: '发送时机',
  risks: '潜在风险',
  advice: '建议',
  dropScreenshot: '将聊天截图拖到此处，或点击上传',
  chooseFile: '选择文件',
  archiveNameLabel: '对方的名字或昵称 *',
  archiveNamePlaceholder: '例如：Alex、暗恋对象...',
  yourNameLabel: '你的名字（用于导入匹配）',
  yourNamePlaceholder: '你在聊天中的用户名',
  contextLabel: '背景说明（可选）',
  contextPlaceholder: '你们是怎么认识的？目前是什么情况？',
  cancel: '取消',
  createArchive: '创建存档',
  newArchiveTitle: '新建存档',
  newArchiveSub: '为一个人单独创建分析空间，存档之间互不干扰。',
  settingsTitle: '设置',
  settingsSub: '配置你的模型服务商。API Key 在服务器端加密存储，不会返回到浏览器。',
  apiKeyLabel: 'API Key',
  apiKeyPlaceholder: '留空则保持当前密钥不变',
  providerLabel: '服务商',
  providerAnthropic: 'Anthropic',
  providerOpenAI: 'OpenAI 兼容',
  baseUrlLabel: 'Base URL',
  modelLabel: '模型',
  languageLabel: '语言',
  uiLanguage: '界面及 AI 响应语言',
  privacyNote:
    '🔒 自托管：你的数据保存在你自己服务器的数据库中，API Key 加密存储。所有模型调用都通过服务器代理——密钥不会到达浏览器。',
  saveKey: '保存',
  saved: '✓ 已保存',
  msgs: '条消息',
  deleteConfirm: '确定删除存档"{name}"及其所有数据？',
  runAnalysis: '开始分析',
  addMoreMessages: '至少添加 5 条消息后才能分析。',
  noAnalysisYet: '点击"分析"按钮，根据聊天记录生成洞察。',
  noMessages: '还没有消息。导入聊天文件或手动添加消息。',
  showingLast: '显示最近 100 条（共 {n} 条）',
  me: '我',
  them: '对方',
  exampleOutput: '示例输出',
  importHint:
    'Instagram：设置 → 你的动态 → 下载你的信息\nWhatsApp：打开对话 → ⋮ → 更多 → 导出聊天记录',
  exportArchive: '导出',
  importArchive: '导入',
  signIn: '登录',
  signingIn: '登录中...',
  emailLabel: '邮箱',
  passwordLabel: '密码',
  loginTitle: 'HeartLens',
  loginSub: '登录你的账户。',
  loginError: '邮箱或密码错误。',
};

const ja: Dict = {
  appName: 'HeartLens',
  newArchive: '+ 新規アーカイブ',
  apiConnected: '設定済み',
  noApiKey: '未設定',
  settings: '⚙ 設定',
  signOut: 'ログアウト',
  analyze: '◈ 分析',
  analyzing: '⟳ 分析中...',
  tabMessages: '💬 メッセージ',
  tabJournal: '📓 ジャーナル',
  tabAnalysis: '◈ 分析',
  tabPredict: '⚡ 予測',
  tabImage: '🖼 スクショ',
  importTitle: 'チャット履歴をインポート',
  addMessage: 'メッセージを手入力...',
  add: '追加',
  newEntry: '新しい記録',
  journalPlaceholder: '何が起きた？どう感じた？覚えておきたいこと...',
  tagsPlaceholder: 'タグ：約束, ポジティブ, 不確か...',
  voiceNote: '🎙 音声メモ',
  tapStop: 'タップして停止',
  transcribing: '文字起こし中...',
  saveEntry: '保存',
  journalDesc:
    '起きたことを文字または音声で記録しましょう。これらのメモは会話分析のコンテキストとして使われます。',
  engScore: 'エンゲージメント',
  stats: 'メッセージ統計',
  total: '合計',
  fromYou: '自分',
  fromThem: '相手',
  avgWords: '平均語数',
  greenFlags: '✓ グッドサイン',
  watchOut: '⚠ 注意点',
  topicReactions: 'トピック別反応',
  commStyle: 'コミュニケーションスタイル',
  keyInsights: '重要なインサイト',
  patterns: 'パターン',
  predictTitle: 'メッセージ予測',
  predictDesc: '送ろうとしているメッセージを入力すると、相手のパターンから返信を予測します。',
  predictBtn: '⚡ 返信を予測',
  likelyResponse: '予測される返信',
  why: '根拠',
  alternatives: '改善バージョン',
  timing: '送信タイミング',
  risks: 'リスク',
  advice: 'アドバイス',
  dropScreenshot: 'スクリーンショットをドロップまたはクリックしてアップロード',
  chooseFile: 'ファイルを選択',
  archiveNameLabel: '相手の名前またはニックネーム *',
  archiveNamePlaceholder: '例：Alex、気になる人...',
  yourNameLabel: '自分の名前（インポート時のマッチング用）',
  yourNamePlaceholder: 'チャット内のユーザー名',
  contextLabel: '背景メモ（任意）',
  contextPlaceholder: 'どんな関係？現在の状況は？',
  cancel: 'キャンセル',
  createArchive: 'アーカイブ作成',
  newArchiveTitle: '新規アーカイブ',
  newArchiveSub: '一人につき一つのアーカイブを作成して分析できます。',
  settingsTitle: '設定',
  settingsSub: 'モデルプロバイダーを設定します。APIキーはサーバー側で暗号化され、ブラウザには返されません。',
  apiKeyLabel: 'API Key',
  apiKeyPlaceholder: '空欄のままにすると現在のキーを保持します',
  providerLabel: 'プロバイダー',
  providerAnthropic: 'Anthropic',
  providerOpenAI: 'OpenAI 互換',
  baseUrlLabel: 'Base URL',
  modelLabel: 'モデル',
  languageLabel: '言語',
  uiLanguage: 'インターフェースとAIの応答言語',
  privacyNote:
    '🔒 セルフホスト：データは自分のサーバーのデータベースに保存され、APIキーは暗号化されます。すべてのモデル呼び出しはサーバー経由——キーがブラウザに届くことはありません。',
  saveKey: '保存',
  saved: '✓ 保存済み',
  msgs: '件',
  deleteConfirm: 'アーカイブ「{name}」とすべてのデータを削除しますか？',
  runAnalysis: '分析を実行',
  addMoreMessages: 'メッセージを5件以上追加してから分析してください。',
  noAnalysisYet: '「分析」ボタンをクリックしてインサイトを生成します。',
  noMessages: 'メッセージがありません。チャットファイルをインポートするか手動で追加してください。',
  showingLast: '最新100件を表示（全{n}件）',
  me: '自分',
  them: '相手',
  exampleOutput: '出力例',
  importHint:
    'Instagram: 設定 → アクティビティ → 情報のダウンロード\nWhatsApp: チャット → ⋮ → その他 → チャットをエクスポート',
  exportArchive: 'エクスポート',
  importArchive: 'インポート',
  signIn: 'ログイン',
  signingIn: 'ログイン中...',
  emailLabel: 'メール',
  passwordLabel: 'パスワード',
  loginTitle: 'HeartLens',
  loginSub: 'アカウントにログイン。',
  loginError: 'メールまたはパスワードが正しくありません。',
};

const T: Record<string, Dict> = { en, zh, ja };

export type Translations = Dict;

export function getT(lang: string): Translations {
  return { ...en, ...(T[lang] || {}) };
}

export function getAILanguageInstruction(lang: string): string {
  const langName = LANGUAGES.find((l) => l.code === lang)?.name || 'English';
  if (lang === 'en') return '';
  return `\n\nIMPORTANT: Respond entirely in ${langName}. All JSON keys remain in English, but all string values must be in ${langName}.`;
}
