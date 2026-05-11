import catalog from '@/config/experiment-catalog.js';
import { getRecordCenterData } from '@/utils/recordCenter.js';
import { getAllProgress } from '@/utils/experimentProgress.js';

const STORAGE_KEY = 'growth_ability_progress_v1';
const SCHEMA_VERSION = 1;
const ABILITY_CAP = 90;

const ABILITY_RULES = {
  reasoning: { firstIncrement: 25, repeatIncrement: 5, firstVariance: 3, repeatVariance: 2, firstMax: 75, cap: 90, group: 'science' },
  design: { firstIncrement: 25, repeatIncrement: 5, firstVariance: 3, repeatVariance: 2, firstMax: 75, cap: 90, group: 'science' },
  handsOn: { firstIncrement: 25, repeatIncrement: 5, firstVariance: 3, repeatVariance: 2, firstMax: 75, cap: 90, group: 'science' },
  dataAnalysis: { firstIncrement: 25, repeatIncrement: 5, firstVariance: 3, repeatVariance: 2, firstMax: 75, cap: 90, group: 'science' },
  reportMaking: { firstIncrement: 25, repeatIncrement: 5, firstVariance: 3, repeatVariance: 2, firstMax: 75, cap: 90, group: 'science' },
  engineeringDesign: { firstIncrement: 10, repeatIncrement: 1, firstVariance: 2, repeatVariance: 0.4, firstMax: 80, cap: 90, group: 'engineering' },
  modelBuilding: { firstIncrement: 10, repeatIncrement: 1, firstVariance: 2, repeatVariance: 0.4, firstMax: 80, cap: 90, group: 'engineering' },
  modelTesting: { firstIncrement: 10, repeatIncrement: 1, firstVariance: 2, repeatVariance: 0.4, firstMax: 80, cap: 90, group: 'engineering' },
  optimization: { firstIncrement: 10, repeatIncrement: 1, firstVariance: 2, repeatVariance: 0.4, firstMax: 80, cap: 90, group: 'engineering' },
  engineeringReport: { firstIncrement: 10, repeatIncrement: 1, firstVariance: 2, repeatVariance: 0.4, firstMax: 80, cap: 90, group: 'engineering' }
};

const ALL_ABILITY_KEYS = Object.keys(ABILITY_RULES);
const toArray = (value) => (Array.isArray(value) ? value : []);
const toInt = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, Math.floor(n)) : 0;
};
const toScore = (value) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.max(0, n) : 0;
};
const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const round1 = (value) => Math.round(Number(value || 0) * 10) / 10;
const hasNum = (value) => Number.isFinite(Number(value));
const randomBetween = (min, max) => min + Math.random() * (max - min);

const average = (values = []) => {
  const list = values.filter((v) => Number.isFinite(v));
  if (!list.length) return 0;
  const total = list.reduce((sum, item) => sum + item, 0);
  return Math.round(total / list.length);
};

const nowIso = () => new Date().toISOString();

const getAllExperiments = () => (catalog.categories || []).reduce((list, category) => {
  const items = (category.items || []).map((item) => ({
    id: item.id,
    legacyId: item.legacyId,
    categoryKey: category.key
  }));
  return list.concat(items);
}, []);

const getExperimentMaps = () => {
  const experiments = getAllExperiments();
  const idSet = new Set(experiments.map((item) => item.id));
  const legacyToId = {};
  experiments.forEach((item) => {
    if (item.legacyId !== null && item.legacyId !== undefined) {
      legacyToId[String(item.legacyId)] = item.id;
    }
  });
  return { experiments, idSet, legacyToId };
};

const normalizeExperimentId = (value, maps) => {
  if (value === null || value === undefined) return '';
  const raw = String(value).trim();
  if (!raw) return '';
  if (maps.idSet.has(raw)) return raw;
  return maps.legacyToId[raw] || '';
};

const createAbilityState = () => ({
  score: 0,
  firstScore: 0,
  repeatScore: 0,
  firstDoneExperimentIds: [],
  repeatCount: 0,
  updatedAt: ''
});

const createEmptyState = () => ({
  schemaVersion: SCHEMA_VERSION,
  bootstrapped: false,
  updatedAt: nowIso(),
  abilities: ALL_ABILITY_KEYS.reduce((acc, key) => {
    acc[key] = createAbilityState();
    return acc;
  }, {})
});

const normalizeAbilityState = (raw) => {
  const base = createEmptyState();
  if (!raw || typeof raw !== 'object') return base;

  const next = {
    ...base,
    ...raw,
    schemaVersion: SCHEMA_VERSION,
    abilities: { ...base.abilities }
  };

  ALL_ABILITY_KEYS.forEach((key) => {
    const rule = ABILITY_RULES[key];
    const input = raw.abilities && raw.abilities[key] ? raw.abilities[key] : {};
    const firstDone = toArray(input.firstDoneExperimentIds).map((id) => String(id));
    const defaultFirstScore = Math.min(firstDone.length * rule.firstIncrement, rule.firstMax);
    const firstScore = clamp(
      round1(hasNum(input.firstScore) ? toScore(input.firstScore) : defaultFirstScore),
      0,
      rule.firstMax
    );
    const repeatScore = clamp(
      round1(hasNum(input.repeatScore) ? toScore(input.repeatScore) : Math.max(0, toScore(input.score) - firstScore)),
      0,
      rule.cap - firstScore
    );
    next.abilities[key] = {
      score: clamp(round1(firstScore + repeatScore), 0, rule.cap),
      firstScore,
      repeatScore,
      firstDoneExperimentIds: firstDone,
      repeatCount: toInt(input.repeatCount),
      updatedAt: String(input.updatedAt || '')
    };
  });

  next.updatedAt = String(raw.updatedAt || next.updatedAt || nowIso());
  next.bootstrapped = raw.bootstrapped === true;
  return next;
};

const getState = () => {
  const raw = uni.getStorageSync(STORAGE_KEY);
  return normalizeAbilityState(raw);
};

const saveState = (state) => {
  uni.setStorageSync(STORAGE_KEY, normalizeAbilityState(state));
};

const calcScore = (abilityKey, abilityState) => {
  const rule = ABILITY_RULES[abilityKey];
  if (!rule) return 0;
  if (hasNum(abilityState.firstScore) || hasNum(abilityState.repeatScore)) {
    const firstScore = clamp(round1(toScore(abilityState.firstScore)), 0, rule.firstMax);
    const repeatScore = clamp(round1(toScore(abilityState.repeatScore)), 0, rule.cap - firstScore);
    return clamp(round1(firstScore + repeatScore), 0, rule.cap);
  }
  const firstCount = toArray(abilityState.firstDoneExperimentIds).length;
  const repeatCount = toInt(abilityState.repeatCount);
  const firstScore = Math.min(firstCount * rule.firstIncrement, rule.firstMax);
  const repeatScore = repeatCount * rule.repeatIncrement;
  return clamp(round1(firstScore + repeatScore), 0, rule.cap);
};

const getRandomIncrement = (base, variance) => {
  const min = Math.max(0.2, Number(base) - Number(variance || 0));
  const max = Math.max(min, Number(base) + Number(variance || 0));
  return round1(randomBetween(min, max));
};

const ensureAbility = (state, abilityKey) => {
  if (!state.abilities[abilityKey]) state.abilities[abilityKey] = createAbilityState();
  return state.abilities[abilityKey];
};

const getGroupExperimentIds = (groupKey) => {
  const experiments = getAllExperiments();
  return experiments
    .filter((item) => item.categoryKey === groupKey)
    .map((item) => item.id);
};

const isExperimentInRuleGroup = (abilityKey, experimentId) => {
  const rule = ABILITY_RULES[abilityKey];
  if (!rule) return false;
  const groupIds = getGroupExperimentIds(rule.group);
  return groupIds.includes(experimentId);
};

const collectRecordExperimentSets = () => {
  const maps = getExperimentMaps();
  const recordCenter = getRecordCenterData();
  const allProgress = getAllProgress() || {};

  const setFromRecords = (rows = []) => {
    const set = new Set();
    rows.forEach((row) => {
      const id = normalizeExperimentId(row && row.experimentId, maps);
      if (id) set.add(id);
    });
    return set;
  };

  const principleSet = new Set();
  const virtualSet = new Set();
  const dataByProgressSet = new Set();

  Object.keys(allProgress || {}).forEach((key) => {
    const id = normalizeExperimentId(key, maps);
    if (!id) return;
    const p = allProgress[key] || {};
    if (p.principleLearned) principleSet.add(id);
    if (p.virtualLabCompleted) virtualSet.add(id);
    if (p.dataUploaded) dataByProgressSet.add(id);
  });

  const planSet = setFromRecords(recordCenter.plans);
  const dataSet = setFromRecords(recordCenter.data);
  const reportSet = setFromRecords(recordCenter.reports);
  dataByProgressSet.forEach((id) => dataSet.add(id));

  return {
    principleSet,
    virtualSet,
    planSet,
    dataSet,
    reportSet
  };
};

const applyBootstrapSnapshot = (state) => {
  const sets = collectRecordExperimentSets();
  const scienceIds = getGroupExperimentIds('science');
  const engineeringIds = getGroupExperimentIds('engineering');

  const assignFirstDone = (abilityKey, sourceSet, allowedIds) => {
    const rule = ABILITY_RULES[abilityKey];
    const item = ensureAbility(state, abilityKey);
    const firstDone = allowedIds.filter((id) => sourceSet.has(id));
    item.firstDoneExperimentIds = firstDone;
    item.repeatCount = 0;
    item.firstScore = round1(Math.min(firstDone.length * rule.firstIncrement, rule.firstMax));
    item.repeatScore = 0;
    item.score = calcScore(abilityKey, item);
    item.updatedAt = nowIso();
  };

  assignFirstDone('reasoning', sets.principleSet, scienceIds);
  assignFirstDone('design', sets.planSet, scienceIds);
  assignFirstDone('handsOn', sets.virtualSet, scienceIds);
  assignFirstDone('dataAnalysis', sets.dataSet, scienceIds);
  assignFirstDone('reportMaking', sets.reportSet, scienceIds);

  assignFirstDone('engineeringDesign', sets.planSet, engineeringIds);
  assignFirstDone('modelBuilding', sets.virtualSet, engineeringIds);
  assignFirstDone('modelTesting', sets.dataSet, engineeringIds);
  assignFirstDone('optimization', new Set(), engineeringIds);
  assignFirstDone('engineeringReport', sets.reportSet, engineeringIds);

  state.bootstrapped = true;
  state.updatedAt = nowIso();
  return state;
};

export const bootstrapGrowthAbilityStateIfNeeded = () => {
  const raw = uni.getStorageSync(STORAGE_KEY);
  const hasExisting = raw && typeof raw === 'object' && raw.schemaVersion === SCHEMA_VERSION;
  if (hasExisting) return normalizeAbilityState(raw);

  const next = applyBootstrapSnapshot(createEmptyState());
  saveState(next);
  return next;
};

export const trackGrowthAbilityEvent = (abilityKey, experimentId) => {
  if (!ABILITY_RULES[abilityKey]) return null;
  const rule = ABILITY_RULES[abilityKey];
  const maps = getExperimentMaps();
  const normalizedExperimentId = normalizeExperimentId(experimentId, maps);
  if (!normalizedExperimentId) return null;
  if (!isExperimentInRuleGroup(abilityKey, normalizedExperimentId)) return null;

  const state = bootstrapGrowthAbilityStateIfNeeded();
  const ability = ensureAbility(state, abilityKey);
  const firstDone = new Set(toArray(ability.firstDoneExperimentIds));
  ability.firstScore = clamp(round1(toScore(ability.firstScore)), 0, rule.firstMax);
  ability.repeatScore = clamp(round1(toScore(ability.repeatScore)), 0, rule.cap - ability.firstScore);

  let delta = 0;
  let eventType = 'repeat';

  if (firstDone.has(normalizedExperimentId)) {
    delta = getRandomIncrement(rule.repeatIncrement, rule.repeatVariance);
    ability.repeatCount = toInt(ability.repeatCount) + 1;
    ability.repeatScore = clamp(round1(ability.repeatScore + delta), 0, rule.cap - ability.firstScore);
  } else {
    const groupTotal = getGroupExperimentIds(rule.group).length;
    const willBeFirstCount = firstDone.size + 1;
    if (groupTotal > 0 && willBeFirstCount >= groupTotal) {
      delta = round1(Math.max(0, rule.firstMax - ability.firstScore));
    } else {
      delta = getRandomIncrement(rule.firstIncrement, rule.firstVariance);
    }
    eventType = 'first';
    firstDone.add(normalizedExperimentId);
    ability.firstDoneExperimentIds = Array.from(firstDone);
    ability.firstScore = clamp(round1(ability.firstScore + delta), 0, rule.firstMax);
    ability.repeatScore = clamp(round1(ability.repeatScore), 0, rule.cap - ability.firstScore);
  }

  ability.score = calcScore(abilityKey, ability);
  ability.updatedAt = nowIso();
  state.updatedAt = ability.updatedAt;
  saveState(state);
  return {
    abilityKey,
    experimentId: normalizedExperimentId,
    eventType,
    delta,
    score: ability.score
  };
};

export const getGrowthAbilitySnapshot = () => bootstrapGrowthAbilityStateIfNeeded();

export const getGrowthAbilityDashboard = () => {
  const state = bootstrapGrowthAbilityStateIfNeeded();
  const score = (key) => {
    const item = state.abilities[key] || {};
    return clamp(Math.round(toScore(item.score)), 0, ABILITY_CAP);
  };

  const scientificThinkingChildren = {
    reasoning: score('reasoning'),
    design: score('design')
  };
  const scientificInquiryChildren = {
    handsOn: score('handsOn'),
    dataAnalysis: score('dataAnalysis'),
    reportMaking: score('reportMaking')
  };
  const engineeringThinkingChildren = {
    engineeringDesign: score('engineeringDesign')
  };
  const engineeringInquiryChildren = {
    modelBuilding: score('modelBuilding'),
    modelTesting: score('modelTesting'),
    optimization: score('optimization'),
    engineeringReport: score('engineeringReport')
  };

  const categories = {
    scientificThinking: {
      value: average(Object.values(scientificThinkingChildren)),
      children: scientificThinkingChildren
    },
    scientificInquiry: {
      value: average(Object.values(scientificInquiryChildren)),
      children: scientificInquiryChildren
    },
    engineeringThinking: {
      value: average(Object.values(engineeringThinkingChildren)),
      children: engineeringThinkingChildren
    },
    engineeringInquiry: {
      value: average(Object.values(engineeringInquiryChildren)),
      children: engineeringInquiryChildren
    }
  };

  const overall = clamp(
    average([
      categories.scientificThinking.value,
      categories.scientificInquiry.value,
      categories.engineeringThinking.value,
      categories.engineeringInquiry.value
    ]),
    0,
    ABILITY_CAP
  );

  return {
    overall,
    categories,
    abilities: state.abilities,
    updatedAt: state.updatedAt
  };
};

export const resetGrowthAbilityState = () => {
  uni.removeStorageSync(STORAGE_KEY);
};

export default {
  trackGrowthAbilityEvent,
  getGrowthAbilitySnapshot,
  getGrowthAbilityDashboard,
  bootstrapGrowthAbilityStateIfNeeded,
  resetGrowthAbilityState
};
