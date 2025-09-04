// Safe environment variable access utility
// Handles cases where import.meta may not be available

export const safeImportMeta = (() => {
  try {
    return typeof import.meta !== 'undefined' ? import.meta : null;
  } catch {
    return null;
  }
})();

export const safeEnv = (() => {
  try {
    return safeImportMeta?.env || {};
  } catch {
    return {};
  }
})();

export const isDevelopment = () => {
  try {
    return safeEnv.MODE === 'development' || safeEnv.DEV === true;
  } catch {
    return false;
  }
};

export const isProduction = () => {
  try {
    return safeEnv.MODE === 'production' || safeEnv.PROD === true;
  } catch {
    return true; // Default to production if we can't determine
  }
};

export const getEnvVar = (key: string, fallback = ''): string => {
  try {
    return safeEnv[key] || fallback;
  } catch {
    return fallback;
  }
};