const FLOW_DRAFT_KEY = 'experiment_flow_v2_drafts';
const DRAFT_SCHEMA_VERSION = 2;
const ENGINEERING_STEP6_FINAL_RESULT_ID = 'manual_spinner_final_model';

const getDraftMap = () => {
  const raw = uni.getStorageSync(FLOW_DRAFT_KEY);
  if (raw && typeof raw === 'object') return raw;
  return {};
};

const setDraftMap = (value) => {
  uni.setStorageSync(FLOW_DRAFT_KEY, value || {});
};

const isNonEmptyString = (value) => typeof value === 'string' && value.trim().length > 0;
const isEngineeringExperimentId = (experimentId) => String(experimentId || '').startsWith('engineering-');
const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const deriveEngineeringStep6Stage = (step6 = {}) => {
  if (step6.virtualCompleted === true) return 'done';
  const resultItems = Array.isArray(step6.resultItems) ? step6.resultItems : [];
  if (resultItems.includes(ENGINEERING_STEP6_FINAL_RESULT_ID)) return 'upload';
  return 'build';
};

const migrateEngineeringStep6 = (step6 = {}) => {
  const next = { ...step6 };
  let changed = false;

  if (Object.prototype.hasOwnProperty.call(next, 'operationChoice')) {
    delete next.operationChoice;
    changed = true;
  }
  if (Object.prototype.hasOwnProperty.call(next, 'operationWatched')) {
    delete next.operationWatched;
    changed = true;
  }

  if (!Array.isArray(next.workspaceItems)) {
    next.workspaceItems = [];
    changed = true;
  }
  if (!Array.isArray(next.workspaceLayout)) {
    next.workspaceLayout = [];
    changed = true;
  }
  if (!Array.isArray(next.resultItems)) {
    next.resultItems = [];
    changed = true;
  }
  if (!next.recipeProgress || typeof next.recipeProgress !== 'object') {
    next.recipeProgress = {};
    changed = true;
  }
  if (!Array.isArray(next.actionLogs)) {
    next.actionLogs = [];
    changed = true;
  }
  if (!Array.isArray(next.evidenceList)) {
    next.evidenceList = [];
    changed = true;
  }
  if (!Array.isArray(next.offlineEvidenceList)) {
    next.offlineEvidenceList = [];
    changed = true;
  }

  const stage = deriveEngineeringStep6Stage(next);
  if (!isNonEmptyString(next.step6Stage) || next.step6Stage !== stage) {
    next.step6Stage = stage;
    changed = true;
  }

  return { step6: next, changed };
};

const buildEngineeringStep6Diff = (beforeStep6 = {}, afterStep6 = {}) => {
  const removedFields = [];
  const defaultedFields = [];

  if (hasOwn(beforeStep6, 'operationChoice') && !hasOwn(afterStep6, 'operationChoice')) {
    removedFields.push('operationChoice');
  }
  if (hasOwn(beforeStep6, 'operationWatched') && !hasOwn(afterStep6, 'operationWatched')) {
    removedFields.push('operationWatched');
  }

  if (!Array.isArray(beforeStep6.workspaceItems) && Array.isArray(afterStep6.workspaceItems)) {
    defaultedFields.push('workspaceItems[]');
  }
  if (!Array.isArray(beforeStep6.workspaceLayout) && Array.isArray(afterStep6.workspaceLayout)) {
    defaultedFields.push('workspaceLayout[]');
  }
  if (!Array.isArray(beforeStep6.resultItems) && Array.isArray(afterStep6.resultItems)) {
    defaultedFields.push('resultItems[]');
  }
  if ((!beforeStep6.recipeProgress || typeof beforeStep6.recipeProgress !== 'object')
    && afterStep6.recipeProgress && typeof afterStep6.recipeProgress === 'object') {
    defaultedFields.push('recipeProgress{}');
  }
  if (!Array.isArray(beforeStep6.actionLogs) && Array.isArray(afterStep6.actionLogs)) {
    defaultedFields.push('actionLogs[]');
  }
  if (!Array.isArray(beforeStep6.evidenceList) && Array.isArray(afterStep6.evidenceList)) {
    defaultedFields.push('evidenceList[]');
  }
  if (!Array.isArray(beforeStep6.offlineEvidenceList) && Array.isArray(afterStep6.offlineEvidenceList)) {
    defaultedFields.push('offlineEvidenceList[]');
  }

  const stageBefore = isNonEmptyString(beforeStep6.step6Stage) ? beforeStep6.step6Stage : '(empty)';
  const stageAfter = isNonEmptyString(afterStep6.step6Stage) ? afterStep6.step6Stage : '(empty)';

  return {
    removedFields,
    defaultedFields,
    stageBefore,
    stageAfter,
    stageChanged: stageBefore !== stageAfter
  };
};

const migrateDraftPayload = (experimentId, payload) => {
  if (!payload || typeof payload !== 'object') {
    return { payload, changed: false };
  }

  let changed = false;
  let nextPayload = { ...payload };

  if (nextPayload.schemaVersion !== DRAFT_SCHEMA_VERSION) {
    nextPayload.schemaVersion = DRAFT_SCHEMA_VERSION;
    changed = true;
  }

  if (isEngineeringExperimentId(experimentId) && nextPayload.flowData && typeof nextPayload.flowData === 'object') {
    const currentStep6 = nextPayload.flowData.step6 || {};
    const migrated = migrateEngineeringStep6(currentStep6);
    if (migrated.changed) {
      nextPayload = {
        ...nextPayload,
        flowData: {
          ...nextPayload.flowData,
          step6: migrated.step6
        }
      };
      changed = true;
    }
  }

  return { payload: nextPayload, changed };
};

export const diagnoseFlowDraftMigrations = (options = {}) => {
  const includeUnchanged = options.includeUnchanged === true;
  const maxItems = Number.isFinite(Number(options.maxItems)) ? Math.max(1, Number(options.maxItems)) : 200;

  const map = getDraftMap();
  const entries = Object.entries(map || {});

  const summary = {
    generatedAt: Date.now(),
    schemaVersionTarget: DRAFT_SCHEMA_VERSION,
    totalDrafts: entries.length,
    engineeringDrafts: 0,
    draftsNeedMigration: 0,
    engineeringStep6NeedMigration: 0
  };

  const items = [];

  entries.forEach(([experimentId, draft]) => {
    const migrated = migrateDraftPayload(experimentId, draft);
    const needsMigration = migrated.changed === true;
    const isEngineering = isEngineeringExperimentId(experimentId);

    if (isEngineering) summary.engineeringDrafts += 1;
    if (needsMigration) summary.draftsNeedMigration += 1;

    const row = {
      experimentId,
      isEngineering,
      needsMigration,
      schemaVersionBefore: draft && typeof draft === 'object' ? (draft.schemaVersion || null) : null,
      schemaVersionAfter: migrated.payload && typeof migrated.payload === 'object'
        ? (migrated.payload.schemaVersion || null)
        : null
    };

    if (isEngineering) {
      const beforeStep6 = (draft && draft.flowData && draft.flowData.step6) || {};
      const afterStep6 = (migrated.payload && migrated.payload.flowData && migrated.payload.flowData.step6) || {};
      const step6Diff = buildEngineeringStep6Diff(beforeStep6, afterStep6);
      row.step6Diff = step6Diff;
      const step6Changed = step6Diff.removedFields.length > 0
        || step6Diff.defaultedFields.length > 0
        || step6Diff.stageChanged;
      if (step6Changed) summary.engineeringStep6NeedMigration += 1;
    }

    if (needsMigration || includeUnchanged) {
      if (items.length < maxItems) {
        items.push(row);
      }
    }
  });

  return { summary, items };
};

export const printFlowDraftMigrationDiagnostics = (options = {}) => {
  const report = diagnoseFlowDraftMigrations({
    includeUnchanged: options.includeUnchanged === true,
    maxItems: options.maxItems
  });

  const logger = (typeof console !== 'undefined' && typeof console.log === 'function')
    ? console.log.bind(console)
    : () => {};
  const group = (typeof console !== 'undefined' && typeof console.group === 'function')
    ? console.group.bind(console)
    : logger;
  const groupEnd = (typeof console !== 'undefined' && typeof console.groupEnd === 'function')
    ? console.groupEnd.bind(console)
    : () => {};

  group('[FlowDraftDiagnostics] migration summary');
  logger('summary:', report.summary);
  report.items.forEach((item) => {
    if (!item.isEngineering || !item.step6Diff) {
      logger(item.experimentId, item);
      return;
    }
    logger(item.experimentId, {
      needsMigration: item.needsMigration,
      schemaVersionBefore: item.schemaVersionBefore,
      schemaVersionAfter: item.schemaVersionAfter,
      removedFields: item.step6Diff.removedFields,
      defaultedFields: item.step6Diff.defaultedFields,
      stageBefore: item.step6Diff.stageBefore,
      stageAfter: item.step6Diff.stageAfter
    });
  });
  groupEnd();

  return report;
};

export const createInitialFlowData = () => ({
  step1: {
    videoWatched: false,
    selectedHypothesis: '',
    customHypothesis: '',
    aiHint: '',
    aiResult: null
  },
  step2: {
    participants: '',
    date: '',
    environment: ''
  },
  step3: {
    question: '',
    hypothesisText: ''
  },
  step4: {
    selectedGoals: [],
    aiChecked: false,
    aiAnalysis: null
  },
  step5: {
    strategyChoice: '',
    sceneChoice: '',
    materialList: '',
    materialItems: [],
    customMaterials: [],
    aiChecked: false,
    aiAnalysis: null,
    extraMaterials: ''
  },
  step6: {
    selectedIndependentKey: '',
    selectionMap: {
      independent: '',
      dependent: '',
      control: ''
    },
    independentVariable: '',
    dependentVariable: '',
    controlVariable: '',
    aiChecked: false,
    aiAnalysis: null
  },
  step7: {
    majorSteps: [],
    detailSteps: '',
    planGenerated: false,
    generatedAt: ''
  },
  step8: {
    projectId: '',
    modelName: '',
    experimentVideo: '',
    initialParts: {},
    materialsPool: [],
    toolsPool: [],
    workspaceItems: [],
    workspaceLayout: [],
    resultItems: [],
    recipeProgress: {},
    actionLogs: [],
    operationVideoChoice: '',
    operationVideoWatched: {
      op1: false,
      op2: false
    },
    operationChoice: '',
    operationWatched: {
      op1: false,
      op2: false
    },
    offlineEvidenceList: [],
    step8Stage: 'build',
    virtualLabNote: '',
    evidenceList: [],
    completed: false,
    completedAt: ''
  },
  step9: {
    independentVariableLabel: '\u65cb\u8f6c\u901f\u5ea6',
    dependentVariableLabel: '\u4e94\u89d2\u661f\u8fd0\u52a8\u72b6\u6001\uff08\u98de\u884c\u9ad8\u4f4e\u548c\u8fdc\u8fd1\uff09',
    slowObservationChoice: '',
    fastObservationChoice: '',
    qualitativeRecord: '',
    findings: '',
    analysisGenerated: false,
    generatedAt: ''
  },
  step10: {
    phenomenon: '',
    principle: '',
    result: '',
    improvement: '',
    reportGenerated: false,
    generatedAt: '',
    templateVersion: 'phase2-report-v1',
    templateContent: ''
  }
});

export const loadFlowDraft = (experimentId) => {
  if (!experimentId) return null;
  const map = getDraftMap();
  const raw = map[experimentId];
  if (!raw) return null;

  const migrated = migrateDraftPayload(experimentId, raw);
  if (migrated.changed) {
    map[experimentId] = {
      ...migrated.payload,
      updatedAt: Date.now()
    };
    setDraftMap(map);
  }
  return migrated.payload;
};

export const saveFlowDraft = (experimentId, payload) => {
  if (!experimentId) return;
  const map = getDraftMap();
  const migrated = migrateDraftPayload(experimentId, payload || {});
  map[experimentId] = {
    ...migrated.payload,
    schemaVersion: DRAFT_SCHEMA_VERSION,
    updatedAt: Date.now()
  };
  setDraftMap(map);
};

export const clearFlowDraft = (experimentId) => {
  if (!experimentId) return;
  const map = getDraftMap();
  delete map[experimentId];
  setDraftMap(map);
};

export default {
  createInitialFlowData,
  loadFlowDraft,
  saveFlowDraft,
  clearFlowDraft,
  diagnoseFlowDraftMigrations,
  printFlowDraftMigrationDiagnostics
};
