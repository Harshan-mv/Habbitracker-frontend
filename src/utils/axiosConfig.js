import axios from 'axios';
import useToastStore from '../store/useToastStore';

const positiveNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};
const retryCount = Math.min(5, positiveNumber(import.meta.env.VITE_API_RETRY_COUNT, 3));
const retryBaseDelay = positiveNumber(import.meta.env.VITE_API_RETRY_BASE_DELAY_MS, 1000);
const retryMaxDelay = positiveNumber(import.meta.env.VITE_API_RETRY_MAX_DELAY_MS, 8000);
const retryableStatuses = new Set([502, 503, 504]);
const apiTimeout = positiveNumber(import.meta.env.VITE_API_TIMEOUT_MS, 65000);
let wakeToastShown = false;
let wakeToastId = null;

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: apiTimeout,
});

export const createIdempotencyKey = () => crypto.randomUUID();

const delay = (duration) => new Promise((resolve) => window.setTimeout(resolve, duration));

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (res.config?._wakeRetries) {
      if (wakeToastId) useToastStore.getState().dismissToast(wakeToastId);
      wakeToastId = null;
      wakeToastShown = false;
    }
    return res;
  },
  async (err) => {
    const config = err.config;
    const method = (config?.method || 'get').toLowerCase();
    const idempotencyKey = config?.headers?.get?.('Idempotency-Key')
      || config?.headers?.['Idempotency-Key'];
    const canRetry = method === 'get' || Boolean(idempotencyKey);
    const isWakeFailure = !err.response
      || retryableStatuses.has(err.response.status)
      || err.code === 'ECONNABORTED'
      || err.code === 'ETIMEDOUT';

    if (err.response?.status === 429) {
      const retryAfter = Number(err.response.headers?.['retry-after'])
        || Number(err.response.data?.retryAfter)
        || 60;
      const message = `Too many requests. Try again in ${retryAfter} seconds.`;
      if (err.response.data) {
        err.response.data.error = message;
        err.response.data.message = message;
      }
    }

    if (config && canRetry && isWakeFailure && (config._wakeRetries || 0) < retryCount) {
      config._wakeRetries = (config._wakeRetries || 0) + 1;
      if (!wakeToastShown) {
        wakeToastId = useToastStore.getState().addToast(
          'Server is waking up, this can take up to 60 seconds…',
          'error',
          (retryCount + 1) * apiTimeout + retryCount * retryMaxDelay + 4000,
        );
        wakeToastShown = true;
      }
      const retryDelay = Math.min(
        retryBaseDelay * (2 ** (config._wakeRetries - 1)),
        retryMaxDelay,
      );
      await delay(retryDelay);
      return api.request(config);
    }

    if (config?._wakeRetries) {
      if (wakeToastId) useToastStore.getState().dismissToast(wakeToastId);
      wakeToastId = null;
      wakeToastShown = false;
    }
    const isInvalidGoogleCredential = err.response?.data?.code === 'INVALID_GOOGLE_CREDENTIAL';
    if (err.response?.status === 401 && !isInvalidGoogleCredential) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    return Promise.reject(err);
  }
);

export default api;
