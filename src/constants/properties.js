import { TAG_PROPERTY_KEYS } from './tags'
import {
    CHECKBOX_ICON_PATH,
    LIST_ICON_PATH,
    NUMBER_ICON_PATH,
    TAG_ICON_PATH,
    TEXT_ICON_PATH
} from './icon-paths'

export const PROPERTY_TYPES = {
    TEXT: 'text',
    NUMBER: 'number',
    LIST: 'list',
    CHECKBOX: 'checkbox',
    TAGS: 'tags',
    UNSUPPORTED: 'unsupported'
}

export const EDITABLE_PROPERTY_TYPES = [
    PROPERTY_TYPES.TEXT,
    PROPERTY_TYPES.NUMBER,
    PROPERTY_TYPES.LIST,
    PROPERTY_TYPES.CHECKBOX
]

export const PROPERTY_DEFAULT_VALUES = {
    [PROPERTY_TYPES.TEXT]: '',
    [PROPERTY_TYPES.NUMBER]: null,
    [PROPERTY_TYPES.LIST]: [],
    [PROPERTY_TYPES.CHECKBOX]: false
}

export const PROPERTY_TYPE_ICON_PATHS = {
    [PROPERTY_TYPES.TEXT]: TEXT_ICON_PATH,
    [PROPERTY_TYPES.NUMBER]: NUMBER_ICON_PATH,
    [PROPERTY_TYPES.LIST]: LIST_ICON_PATH,
    [PROPERTY_TYPES.CHECKBOX]: CHECKBOX_ICON_PATH,
    [PROPERTY_TYPES.TAGS]: TAG_ICON_PATH
}

export const PROPERTY_CHANGES = {
    SET: 'set',
    REMOVE: 'remove',
    RENAME: 'rename'
}

export const KNOWN_PROPERTIES = [
    { key: TAG_PROPERTY_KEYS[0], type: PROPERTY_TYPES.TAGS },
    { key: 'author', type: PROPERTY_TYPES.TEXT },
    { key: 'date', type: PROPERTY_TYPES.TEXT },
    { key: 'status', type: PROPERTY_TYPES.TEXT },
    { key: 'url', type: PROPERTY_TYPES.TEXT },
    { key: 'rating', type: PROPERTY_TYPES.NUMBER },
    { key: 'favorite', type: PROPERTY_TYPES.CHECKBOX }
]

export const RESERVED_PROPERTY_KEYS = TAG_PROPERTY_KEYS
export const PROPERTY_LIST_SEPARATOR = ','
export const PROPERTY_LIST_JOINER = ', '
