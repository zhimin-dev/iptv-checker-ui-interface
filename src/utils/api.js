import { invoke } from '@tauri-apps/api/core'

const DEFAULT_DESKTOP_API_BASE = 'http://127.0.0.1:8089'

let cachedApiBase = ''
let apiBasePromise = null

const hasWindow = typeof window !== 'undefined'

const normalizeBaseUrl = (value = '') => {
    return String(value || '').trim().replace(/\/+$/, '')
}

const isAbsoluteUrl = (value = '') => {
    return /^(?:https?:)?\/\//i.test(String(value || ''))
}

const setCachedApiBase = (value = '') => {
    const normalized = normalizeBaseUrl(value)
    cachedApiBase = normalized
    if (hasWindow) {
        window.__IPTV_CHECKER_API_BASE__ = normalized
    }
    return normalized
}

export const getCachedApiBase = () => {
    if (cachedApiBase) {
        return cachedApiBase
    }
    if (hasWindow && window.__IPTV_CHECKER_API_BASE__) {
        cachedApiBase = normalizeBaseUrl(window.__IPTV_CHECKER_API_BASE__)
        return cachedApiBase
    }
    return ''
}

export const isTauriDesktop = () => {
    return hasWindow && Boolean(window.__TAURI_INTERNALS__)
}

export const getDefaultApiBase = () => {
    if (isTauriDesktop()) {
        return DEFAULT_DESKTOP_API_BASE
    }
    return hasWindow ? window.document.location.origin : DEFAULT_DESKTOP_API_BASE
}

export const primeApiBase = (value = '') => {
    return setCachedApiBase(value || getDefaultApiBase())
}

export const resolveApiBase = async () => {
    const cached = getCachedApiBase()
    if (cached) {
        return cached
    }
    if (!isTauriDesktop()) {
        return primeApiBase()
    }
    if (!apiBasePromise) {
        apiBasePromise = invoke('api_base')
            .then((value) => primeApiBase(value || DEFAULT_DESKTOP_API_BASE))
            .catch(() => primeApiBase(DEFAULT_DESKTOP_API_BASE))
            .finally(() => {
                apiBasePromise = null
            })
    }
    return apiBasePromise
}

export const buildAbsoluteUrl = (path = '', baseUrl = '') => {
    if (!path) {
        return ''
    }
    if (isAbsoluteUrl(path)) {
        return path
    }
    const base = normalizeBaseUrl(baseUrl || getCachedApiBase() || getDefaultApiBase())
    if (!base) {
        return path
    }
    return `${base}/${String(path).replace(/^\/+/, '')}`
}

export const resolveAbsoluteUrl = async (path = '', baseUrl = '') => {
    if (!path) {
        return ''
    }
    const resolvedBaseUrl = baseUrl || await resolveApiBase()
    return buildAbsoluteUrl(path, resolvedBaseUrl)
}
