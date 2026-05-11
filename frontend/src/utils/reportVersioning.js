const toList = (value) => (Array.isArray(value) ? value : []);
const toTime = (value) => {
  const t = new Date(value).getTime();
  return Number.isFinite(t) ? t : 0;
};

const normalizeKey = (value) => String(value || '').trim();

const buildReportId = (experimentId, timestamp = Date.now()) => {
  const safeExp = String(experimentId || 'unknown').replace(/[^\w-]/g, '_');
  const rand = Math.random().toString(36).slice(2, 8);
  return `report-${safeExp}-${timestamp}-${rand}`;
};

const resolveVersionNo = (list, experimentId) => {
  const expKey = normalizeKey(experimentId);
  if (!expKey) return 1;
  const maxVersion = toList(list)
    .filter((item) => normalizeKey(item && item.experimentId) === expKey)
    .reduce((max, item) => {
      const n = Number(item && item.versionNo);
      return Number.isFinite(n) ? Math.max(max, n) : max;
    }, 0);
  return maxVersion + 1;
};

const dedupeIndexByKey = (list, experimentId, dedupeKey) => {
  const expKey = normalizeKey(experimentId);
  const key = normalizeKey(dedupeKey);
  if (!expKey || !key) return -1;
  return toList(list).findIndex((item) => {
    if (!item) return false;
    return normalizeKey(item.experimentId) === expKey && normalizeKey(item.dedupeKey) === key;
  });
};

const sortByDateDesc = (list) => [...toList(list)].sort((a, b) => {
  const bt = toTime(b && (b.generatedAt || b.date));
  const at = toTime(a && (a.generatedAt || a.date));
  return bt - at;
});

export const appendVersionedReportRecord = (reportList, reportData, options = {}) => {
  const list = toList(reportList);
  const payload = reportData && typeof reportData === 'object' ? { ...reportData } : {};
  const experimentId = normalizeKey(payload.experimentId);
  if (!experimentId) return { list, appended: false, item: null };

  const dedupeKey = normalizeKey(options.dedupeKey || payload.generatedAt || payload.date);
  const existIndex = dedupeIndexByKey(list, experimentId, dedupeKey);
  if (existIndex >= 0) {
    const existing = { ...list[existIndex], ...payload, dedupeKey };
    const nextList = [...list];
    nextList[existIndex] = existing;
    return { list: sortByDateDesc(nextList), appended: false, item: existing };
  }

  const versionNo = resolveVersionNo(list, experimentId);
  const item = {
    ...payload,
    id: normalizeKey(payload.id) || buildReportId(experimentId),
    versionNo,
    dedupeKey
  };

  return { list: sortByDateDesc([item, ...list]), appended: true, item };
};

export default {
  appendVersionedReportRecord
};

