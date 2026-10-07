import {
    DATE_PROPERTY_PATTERN,
    DATETIME_PROPERTY_PATTERN,
    KNOWN_PROPERTIES,
    PROPERTY_DEFAULT_VALUES,
    PROPERTY_CHANGES,
    DATE_PART_WIDTH,
    PROPERTY_LIST_JOINER,
    PROPERTY_LIST_SEPARATOR,
    PROPERTY_TYPES,
    RESERVED_PROPERTY_KEYS
} from '@/constants/properties'

const isScalar = (value) => ['string', 'number', 'boolean'].includes(typeof value)

const hasKey = (object, key) => Object.prototype.hasOwnProperty.call(object, key)

const inferStringType = (value) => {
    if (DATE_PROPERTY_PATTERN.test(value)) return PROPERTY_TYPES.DATE
    if (DATETIME_PROPERTY_PATTERN.test(value)) return PROPERTY_TYPES.DATETIME
    return PROPERTY_TYPES.TEXT
}

const pad = (number) => String(number).padStart(DATE_PART_WIDTH, '0')

const formatLocalDate = (date) => (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
)

const formatLocalDateTime = (date) => (
    `${formatLocalDate(date)}T${pad(date.getHours())}:${pad(date.getMinutes())}`
)

export const getDefaultPropertyValue = (type, now) => {
    if (type === PROPERTY_TYPES.DATE) return formatLocalDate(now)
    if (type === PROPERTY_TYPES.DATETIME) return formatLocalDateTime(now)
    return PROPERTY_DEFAULT_VALUES[type]
}

export const inferPropertyType = (value) => {
    if (typeof value === 'string') return inferStringType(value)
    if (value === null || value === undefined) return PROPERTY_TYPES.TEXT
    if (typeof value === 'number') return PROPERTY_TYPES.NUMBER
    if (typeof value === 'boolean') return PROPERTY_TYPES.CHECKBOX
    if (Array.isArray(value) && value.every(isScalar)) return PROPERTY_TYPES.LIST
    return PROPERTY_TYPES.UNSUPPORTED
}

export const buildPropertyRows = (properties) => (
    Object.entries(properties || {}).map(([key, value]) => {
        const type = inferPropertyType(value)

        return {
            key,
            type,
            value: type === PROPERTY_TYPES.UNSUPPORTED ? JSON.stringify(value) : value
        }
    })
)

export const isValidPropertyName = (keys, name) => {
    const trimmed = name.trim()

    return (
        trimmed !== '' &&
        !RESERVED_PROPERTY_KEYS.includes(trimmed.toLowerCase()) &&
        !keys.includes(trimmed)
    )
}

export const applyPropertyChange = (properties, { action, key, nextKey, value }) => {
    const keys = Object.keys(properties)

    switch (action) {
        case PROPERTY_CHANGES.SET: {
            if (hasKey(properties, key)) return { ...properties, [key]: value }
            if (!isValidPropertyName(keys, key)) return properties

            return { ...properties, [key.trim()]: value }
        }
        case PROPERTY_CHANGES.REMOVE: {
            if (!hasKey(properties, key)) return properties

            const next = { ...properties }
            delete next[key]
            return next
        }
        case PROPERTY_CHANGES.RENAME: {
            if (!hasKey(properties, key) || !isValidPropertyName(keys, nextKey)) return properties

            return Object.fromEntries(
                Object.entries(properties).map(([name, current]) => [
                    name === key ? nextKey.trim() : name,
                    current
                ])
            )
        }
        default:
            return properties
    }
}

export const parsePropertyValue = (type, raw) => {
    if (type === PROPERTY_TYPES.NUMBER) {
        const number = Number(raw)
        return raw.trim() === '' || Number.isNaN(number) ? null : number
    }

    if (type === PROPERTY_TYPES.LIST) {
        return raw
            .split(PROPERTY_LIST_SEPARATOR)
            .map((item) => item.trim())
            .filter(Boolean)
    }

    return raw
}

export const formatPropertyValue = (type, value) => {
    if (type === PROPERTY_TYPES.LIST) return value.join(PROPERTY_LIST_JOINER)

    return String(value ?? '')
}

export const buildPropertySuggestions = ({ properties, tags }) => (
    KNOWN_PROPERTIES.filter(({ key, type }) => (
        !(key in properties) && !(type === PROPERTY_TYPES.TAGS && tags.length > 0)
    ))
)
