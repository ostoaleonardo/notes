import {
    CALLOUT_COLORS,
    CALLOUT_DEFAULT_TYPE,
    CALLOUT_TYPE_ALIASES
} from '@/constants/callouts'

export const getCalloutType = (raw) => {
    const type = raw.toLowerCase()
    const resolved = CALLOUT_TYPE_ALIASES[type] || type

    return resolved in CALLOUT_COLORS ? resolved : CALLOUT_DEFAULT_TYPE
}

export const getCalloutTitle = (raw, title) => {
    const custom = title.trim()
    if (custom) return custom

    return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase()
}
