export const toMobileImagePath = (path = '') => {
  if (typeof path !== 'string') return path;
  return path.replace(/\.(png|jpe?g|webp)$/i, '.mobile.jpg');
};

export const joinMobileImagePath = (basePath, name) => `${basePath}/${toMobileImagePath(name)}`;

const STATIC_ASSET_MODULES = import.meta.glob('../static/**/*.{png,jpg,jpeg,webp,gif,svg,mp4,mov,m4v,avi,webm,mkv}', {
  eager: true,
  import: 'default'
});

const normalizeStaticLookupKey = (path = '') => {
  const raw = String(path || '').trim();
  if (!raw) return '';
  let decoded = raw;
  try {
    decoded = decodeURI(raw);
  } catch (error) {
    decoded = raw;
  }
  return decoded
    .replace(/\\/g, '/')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/^\.?\//, '')
    .replace(/^src\/static\//, '')
    .replace(/^static\//, '')
    .replace(/^\/static\//, '');
};

const STATIC_ASSET_URL_MAP = Object.entries(STATIC_ASSET_MODULES).reduce((acc, [key, value]) => {
  const normalized = key.replace(/^..\/static\//, '').replace(/\\/g, '/');
  acc[normalized] = value;
  return acc;
}, {});

export const encodeStaticAssetPath = (path = '') => {
  const raw = String(path || '').trim();
  if (!raw) return '';
  if (/^(data:|blob:|https?:\/\/|\/\/)/i.test(raw)) return raw;
  const normalized = normalizeStaticLookupKey(raw);
  if (normalized && STATIC_ASSET_URL_MAP[normalized]) {
    return STATIC_ASSET_URL_MAP[normalized];
  }
  return encodeURI(raw);
};
