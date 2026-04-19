export const KID_COPY = {
  nav: {
    back: '\u8fd4\u56de',
    saveDraft: '\u4fdd\u5b58\u8349\u7a3f',
    prev: '\u4e0a\u4e00\u6b65',
    next: '\u7ee7\u7eed\u4e0b\u4e00\u6b65',
    finish: '\u5b8c\u6210\u6d41\u7a0b'
  },
  tips: {
    ruleTitle: '\u8fc7\u5173\u5c0f\u63d0\u793a',
    missingTitle: '\u8fd8\u5dee\u4e00\u6b65',
    readyTitle: '\u53ef\u4ee5\u7ee7\u7eed\u5566',
    readyText: '\u8fd9\u4e00\u73af\u8282\u5df2\u7ecf\u5b8c\u6210\uff0c\u70b9\u51fb\u201c\u7ee7\u7eed\u4e0b\u4e00\u6b65\u201d\u5c31\u53ef\u4ee5\u524d\u8fdb\u3002',
    missingPrefix: '\u8fd8\u5dee\uff1a'
  },
  toast: {
    stepNotReady: '\u8fd9\u4e00\u73af\u8282\u8fd8\u6ca1\u5b8c\u6210\uff0c\u5148\u770b\u770b\u63d0\u793a\u518d\u8bd5\u8bd5\u3002',
    draftSaved: '\u8349\u7a3f\u5df2\u4fdd\u5b58'
  }
};

const normalizeLine = (value) => String(value || '').replace(/\s+/g, ' ').trim();

export const toKidMissingHint = (ruleText) => {
  const clean = normalizeLine(ruleText);
  if (!clean) return `${KID_COPY.tips.missingPrefix}\u8bf7\u5148\u5b8c\u6210\u5f53\u524d\u6b65\u9aa4\u3002`;
  return `${KID_COPY.tips.missingPrefix}${clean}`;
};

export const toKidLockedHint = (stepIndex, stepTitle) => {
  const stepNo = Number(stepIndex) > 0 ? Number(stepIndex) : 1;
  const title = normalizeLine(stepTitle);
  return title
    ? `\u8bf7\u5148\u5b8c\u6210\u7b2c${stepNo}\u6b65\uff08${title}\uff09\uff0c\u518d\u8fdb\u5165\u4e0b\u4e00\u6b65\u3002`
    : `\u8bf7\u5148\u5b8c\u6210\u7b2c${stepNo}\u6b65\uff0c\u518d\u8fdb\u5165\u4e0b\u4e00\u6b65\u3002`;
};
