export const sleep = (ms = 400) => new Promise((resolve) => setTimeout(resolve, ms));

export const clone = (payload) => JSON.parse(JSON.stringify(payload));

export const generateId = (prefix) => {
  if (typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID) {
    return `${prefix}-${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
};
