const STORAGE_KEY = 'ai_local_mock_kb_v1';
const MAX_ENTRIES = 260;

const normalizeText = (text = '') => String(text)
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/[，。！？、,.!?;；:："'"（）()【】\[\]<>《》]/g, '');

const buildBigrams = (text = '') => {
  const chars = Array.from(text);
  if (chars.length < 2) return [];
  const grams = [];
  for (let i = 0; i < chars.length - 1; i += 1) {
    grams.push(`${chars[i]}${chars[i + 1]}`);
  }
  return grams;
};

const diceCoefficient = (left = '', right = '') => {
  if (!left || !right) return 0;
  if (left === right) return 1;
  const leftGrams = buildBigrams(left);
  const rightGrams = buildBigrams(right);
  if (leftGrams.length === 0 || rightGrams.length === 0) return 0;

  const rightCount = new Map();
  rightGrams.forEach((gram) => {
    rightCount.set(gram, (rightCount.get(gram) || 0) + 1);
  });

  let overlap = 0;
  leftGrams.forEach((gram) => {
    const count = rightCount.get(gram) || 0;
    if (count > 0) {
      overlap += 1;
      rightCount.set(gram, count - 1);
    }
  });

  return (2 * overlap) / (leftGrams.length + rightGrams.length);
};

const readEntries = () => {
  try {
    const raw = uni.getStorageSync(STORAGE_KEY);
    if (Array.isArray(raw)) return raw;
  } catch (error) {
    console.error('读取本地 AI 知识库失败:', error);
  }
  return [];
};

const writeEntries = (list = []) => {
  try {
    uni.setStorageSync(STORAGE_KEY, list);
  } catch (error) {
    console.error('写入本地 AI 知识库失败:', error);
  }
};

const canStore = (question, answer) => {
  const q = String(question || '').trim();
  const a = String(answer || '').trim();
  return q.length >= 4 && a.length >= 8;
};

export const saveLocalKBSample = ({ scene = 'general', question = '', answer = '', source = 'cloud' }) => {
  if (!canStore(question, answer)) return;
  const qNorm = normalizeText(question);
  if (!qNorm) return;

  const list = readEntries();
  const now = Date.now();
  const nextEntry = {
    id: `${now}-${Math.random().toString(36).slice(2, 8)}`,
    scene,
    question: String(question).trim(),
    answer: String(answer).trim(),
    questionNorm: qNorm,
    source,
    createdAt: now,
    usedAt: 0,
    usedCount: 0
  };

  // 去重：相同 scene + questionNorm 时保留最新答案
  const deduped = list.filter((item) => !(item && item.scene === scene && item.questionNorm === qNorm));
  deduped.unshift(nextEntry);
  if (deduped.length > MAX_ENTRIES) {
    deduped.length = MAX_ENTRIES;
  }
  writeEntries(deduped);
};

const scoreEntry = (entry, messageNorm, scene) => {
  if (!entry || !entry.questionNorm || !entry.answer) return -1;
  let score = diceCoefficient(messageNorm, entry.questionNorm);
  if (entry.scene === scene) score += 0.18;
  if (entry.scene === 'general') score += 0.08;
  if (entry.usedCount > 0) score += Math.min(0.06, entry.usedCount * 0.01);
  return score;
};

const markEntryUsed = (id) => {
  const list = readEntries();
  const next = list.map((item) => {
    if (!item || item.id !== id) return item;
    return {
      ...item,
      usedAt: Date.now(),
      usedCount: Number(item.usedCount || 0) + 1
    };
  });
  writeEntries(next);
};

export const searchLocalKBAnswer = ({ scene = 'general', message = '' }) => {
  const messageNorm = normalizeText(message);
  if (!messageNorm) return '';
  const list = readEntries();
  if (!list.length) return '';

  let best = null;
  let bestScore = 0;
  list.forEach((entry) => {
    const score = scoreEntry(entry, messageNorm, scene);
    if (score > bestScore) {
      bestScore = score;
      best = entry;
    }
  });

  // 阈值控制，避免答非所问
  if (!best || bestScore < 0.52) return '';
  markEntryUsed(best.id);
  return best.answer;
};

export const clearLocalKB = () => {
  writeEntries([]);
};

export const getLocalKBStats = () => {
  const list = readEntries();
  const byScene = list.reduce((acc, item) => {
    const scene = (item && item.scene) || 'general';
    acc[scene] = (acc[scene] || 0) + 1;
    return acc;
  }, {});
  return {
    total: list.length,
    byScene
  };
};

export default {
  saveLocalKBSample,
  searchLocalKBAnswer,
  clearLocalKB,
  getLocalKBStats
};

