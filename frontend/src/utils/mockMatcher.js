import mockKnowledgeBase from './mock-kb.json';

const normalizeText = (text = '') => String(text)
  .toLowerCase()
  .replace(/\s+/g, '')
  .replace(/[，。！？、,.!?;；:："'"（）()【】\[\]<>《》]/g, '');

const buildBigrams = (text) => {
  const chars = Array.from(text || '');
  if (chars.length < 2) return [];
  const grams = [];
  for (let i = 0; i < chars.length - 1; i += 1) {
    grams.push(`${chars[i]}${chars[i + 1]}`);
  }
  return grams;
};

const diceCoefficient = (left, right) => {
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

const pickRandom = (list = []) => {
  if (!Array.isArray(list) || list.length === 0) return '';
  return list[Math.floor(Math.random() * list.length)];
};

const getLatestUserMessage = (history = []) => {
  if (!Array.isArray(history)) return '';
  for (let i = history.length - 1; i >= 0; i -= 1) {
    const item = history[i];
    if (item && item.role === 'user' && item.content) {
      return item.content;
    }
  }
  return '';
};

const scoreBySimilarity = (text, sampleQuestions = []) => {
  if (!Array.isArray(sampleQuestions) || sampleQuestions.length === 0) return 0;
  let best = 0;
  sampleQuestions.forEach((question) => {
    const score = diceCoefficient(text, normalizeText(question));
    if (score > best) best = score;
  });
  if (best >= 0.7) return 3;
  if (best >= 0.5) return 2;
  if (best >= 0.35) return 1;
  return 0;
};

const scoreEntry = ({ entry, normalizedMessage, normalizedContext, scene }) => {
  if (!entry || typeof entry !== 'object') return -1;
  const scenes = Array.isArray(entry.scenes) ? entry.scenes : ['*'];
  const sceneMatched = scenes.includes('*') || scenes.includes(scene);
  if (!sceneMatched) return -1;

  let score = 2; // 场景命中基础分
  const keywords = Array.isArray(entry.keywords) ? entry.keywords : [];
  keywords.forEach((keyword) => {
    const normalizedKeyword = normalizeText(keyword);
    if (!normalizedKeyword) return;
    if (normalizedMessage.includes(normalizedKeyword)) {
      score += 2;
    } else if (normalizedContext.includes(normalizedKeyword)) {
      score += 1;
    }
  });

  score += scoreBySimilarity(normalizedMessage, entry.sampleQuestions || []);
  return score;
};

const getDefaultReply = (scene) => {
  const defaults = mockKnowledgeBase && mockKnowledgeBase.defaultByScene
    ? mockKnowledgeBase.defaultByScene
    : {};
  const sceneReplies = defaults[scene] || defaults.general || [];
  return pickRandom(sceneReplies) || '这是个很棒的问题，我们一起一步一步分析。';
};

const appendEncouragement = (content) => {
  const encouragements = mockKnowledgeBase && Array.isArray(mockKnowledgeBase.encouragements)
    ? mockKnowledgeBase.encouragements
    : [];
  if (encouragements.length === 0) return content;
  if (Math.random() < 0.45) {
    return `${content}\n\n${pickRandom(encouragements)}`;
  }
  return content;
};

export const getMockResponseFromKB = ({ message = '', history = [], scene = 'general' }) => {
  const normalizedMessage = normalizeText(message);
  const normalizedContext = normalizeText(getLatestUserMessage(history));
  const entries = mockKnowledgeBase && Array.isArray(mockKnowledgeBase.entries)
    ? mockKnowledgeBase.entries
    : [];

  let bestEntry = null;
  let bestScore = -1;
  entries.forEach((entry) => {
    const score = scoreEntry({
      entry,
      normalizedMessage,
      normalizedContext,
      scene
    });
    if (score > bestScore) {
      bestScore = score;
      bestEntry = entry;
    }
  });

  const matchedResponse = bestEntry && bestScore >= 3
    ? pickRandom(bestEntry.responses || [])
    : getDefaultReply(scene);

  return appendEncouragement(matchedResponse);
};

export default {
  getMockResponseFromKB
};
