import { router } from 'expo-router'

import { NAVIGATION_LOCK_MS } from '@/constants/navigation'

let lastPush = { key: '', time: 0 }
let currentRoute = { pathname: '', params: {} }

const decode = (value) => {
    try {
        return decodeURIComponent(value)
    } catch {
        return value
    }
}

const toTarget = (href) => {
    if (typeof href === 'string') return { pathname: decode(href.split('?')[0]), params: {} }
    return { pathname: decode(href.pathname), params: href.params ?? {} }
}

const isCurrentRoute = (href) => {
    const target = toTarget(href)
    if (target.pathname !== decode(currentRoute.pathname)) return false

    return Object.entries(target.params).every(
        ([key, value]) => String(currentRoute.params[key]) === String(value)
    )
}

export const setCurrentRoute = (pathname, params = {}) => {
    currentRoute = { pathname, params }
}

export const pushOnce = (href, now = Date.now()) => {
    if (isCurrentRoute(href)) return

    const key = JSON.stringify(href)
    if (lastPush.key === key && now - lastPush.time < NAVIGATION_LOCK_MS) return

    lastPush = { key, time: now }
    router.push(href)
}

export const resetNavigationState = () => {
    lastPush = { key: '', time: 0 }
    currentRoute = { pathname: '', params: {} }
}
