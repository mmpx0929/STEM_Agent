const PLAN_KEY = 'experimentPlanSheets';
const DATA_KEY = 'experimentResults';
const LEGACY_DATA_KEY = 'expRecord';
const REPORT_KEY = 'experimentReports';

const safeString = (value, fallback = '') => {
  if (value === null || value === undefined) return fallback;
  const result = String(value).trim();
  return result || fallback;
};

const normalizeStatusText = (value, fallback = '\u5df2\u5b8c\u6210') => {
  const raw = safeString(value, '');
  if (!raw) return fallback;
  const lower = raw.toLowerCase();
  if (lower === 'complete' || lower === 'completed' || lower === 'done' || lower === 'success') {
    return '\u5df2\u5b8c\u6210';
  }
  if (lower === 'in progress' || lower === 'progress' || lower === 'processing') {
    return '\u8fdb\u884c\u4e2d';
  }
  return raw;
};

const toArray = (raw) => {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') return Object.values(raw);
  return [];
};

const parseTime = (value) => {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 0 : date.getTime();
};

const sortByDateDesc = (list) => [...list].sort((a, b) => parseTime(b.date) - parseTime(a.date));

const normalizePlanRecords = () => {
  const list = toArray(uni.getStorageSync(PLAN_KEY));
  return sortByDateDesc(
    list.map((item, rawIndex) => ({
      id: safeString(item.id, `plan-${rawIndex}`),
      type: 'plan',
      experimentId: safeString(item.experimentId, safeString(item.id, `plan-${rawIndex}`)),
      experimentName: safeString(item.experimentName || item.name, '\u672a\u547d\u540d\u5b9e\u9a8c'),
      date: safeString(item.createTime || item.date),
      status: normalizeStatusText(item.status, '\u5df2\u4fdd\u5b58'),
      summary: safeString(
        item.summary || (item.basicInfo && item.basicInfo.goal) || '\u5df2\u5b8c\u6210\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1',
        '\u5df2\u5b8c\u6210\u5b9e\u9a8c\u65b9\u6848\u8bbe\u8ba1'
      ),
      source: safeString(item.source, 'plan-sheet'),
      canDelete: true,
      origin: {
        key: PLAN_KEY,
        rawIndex
      },
      raw: item
    }))
  );
};

const normalizeDataRecords = () => {
  const fromResults = toArray(uni.getStorageSync(DATA_KEY)).map((item, rawIndex) => ({
    id: safeString(item.id, `data-${rawIndex}`),
    type: 'data',
    experimentId: safeString(item.experimentId, safeString(item.id, `data-${rawIndex}`)),
    experimentName: safeString(item.name || item.experimentName, '\u672a\u547d\u540d\u5b9e\u9a8c'),
    date: safeString(item.date || item.experimentDate || item.time),
    status: normalizeStatusText(item.status, '\u8fdb\u884c\u4e2d'),
    summary: safeString(item.summary || item.result, '\u5df2\u4fdd\u5b58\u6570\u636e\u8bb0\u5f55'),
    source: safeString(item.source, 'experiment-results'),
    canDelete: true,
    origin: {
      key: DATA_KEY,
      rawIndex
    },
    raw: item
  }));

  const legacyItem = uni.getStorageSync(LEGACY_DATA_KEY);
  const legacy = legacyItem
    ? [
        {
          id: safeString(legacyItem.id, 'legacy-exp-record'),
          type: 'data',
          experimentId: safeString(legacyItem.experimentId, 'legacy-exp-record'),
          experimentName: safeString(legacyItem.name, '\u672a\u547d\u540d\u5b9e\u9a8c'),
          date: safeString(legacyItem.date || legacyItem.time),
          status: '\u5df2\u5b8c\u6210',
          summary: safeString(legacyItem.result, '\u5386\u53f2\u8bb0\u5f55'),
          source: 'legacy-exp-record',
          canDelete: true,
          origin: {
            key: LEGACY_DATA_KEY,
            rawIndex: -1
          },
          raw: legacyItem
        }
      ]
    : [];

  return sortByDateDesc([...fromResults, ...legacy]);
};

const normalizeReportRecords = () => {
  const explicitReports = toArray(uni.getStorageSync(REPORT_KEY));
  if (explicitReports.length > 0) {
    return sortByDateDesc(
      explicitReports.map((item, rawIndex) => ({
        id: safeString(item.id, `report-${rawIndex}`),
        type: 'report',
        experimentId: safeString(item.experimentId, safeString(item.id, `report-${rawIndex}`)),
        experimentName: safeString(item.experimentName || item.name, '\u672a\u547d\u540d\u5b9e\u9a8c'),
        date: safeString(item.date || item.updatedAt || item.createTime),
        status: normalizeStatusText(item.status, '\u5df2\u5b8c\u6210'),
        summary: safeString(item.summary || item.conclusion || item.result, '\u5df2\u751f\u6210\u5b9e\u9a8c\u7ed3\u8bba\u62a5\u544a'),
        source: safeString(item.source, 'experiment-reports'),
        canDelete: true,
        origin: {
          key: REPORT_KEY,
          rawIndex
        },
        raw: item
      }))
    );
  }

  const derivedFromData = toArray(uni.getStorageSync(DATA_KEY))
    .filter((item) => item && (item.summary || item.conclusion || item.result))
    .map((item, rawIndex) => ({
      id: safeString(item.id, `derived-report-${rawIndex}`),
      type: 'report',
      experimentId: safeString(item.experimentId, safeString(item.id, `derived-report-${rawIndex}`)),
      experimentName: safeString(item.name || item.experimentName, '\u672a\u547d\u540d\u5b9e\u9a8c'),
      date: safeString(item.date || item.experimentDate || item.time),
      status: '\u5df2\u5b8c\u6210',
      summary: safeString(item.summary || item.conclusion || item.result, '\u7531\u6570\u636e\u8bb0\u5f55\u6620\u5c04\u7684\u7ed3\u8bba\u6458\u8981'),
      source: 'derived-from-data-record',
      canDelete: false,
      origin: {
        key: 'derived-from-data-record',
        rawIndex
      },
      raw: item
    }));

  return sortByDateDesc(derivedFromData);
};

const removeByIndex = (key, rawIndex) => {
  const list = toArray(uni.getStorageSync(key));
  if (rawIndex < 0 || rawIndex >= list.length) return false;
  list.splice(rawIndex, 1);
  uni.setStorageSync(key, list);
  return true;
};

export const getRecordCenterData = () => {
  const plans = normalizePlanRecords();
  const data = normalizeDataRecords();
  const reports = normalizeReportRecords();
  return { plans, data, reports };
};

export const getRecordCenterStats = () => {
  const { plans, data, reports } = getRecordCenterData();
  return {
    total: plans.length + data.length + reports.length,
    plans: plans.length,
    data: data.length,
    reports: reports.length
  };
};

export const getRecordByTypeAndId = (type, id) => {
  if (!type || !id) return null;
  const { plans, data, reports } = getRecordCenterData();
  const bucket = type === 'plan' ? plans : type === 'data' ? data : reports;
  return bucket.find((item) => String(item.id) === String(id)) || null;
};

export const removeRecord = (record) => {
  if (!record || !record.origin || !record.origin.key) return false;
  if (record.canDelete === false) return false;

  const { key, rawIndex } = record.origin;
  if (key === LEGACY_DATA_KEY) {
    uni.removeStorageSync(LEGACY_DATA_KEY);
    return true;
  }

  if (key === PLAN_KEY || key === DATA_KEY || key === REPORT_KEY) {
    return removeByIndex(key, rawIndex);
  }

  return false;
};

export default {
  getRecordCenterData,
  getRecordCenterStats,
  getRecordByTypeAndId,
  removeRecord
};
