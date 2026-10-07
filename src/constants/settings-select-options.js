import { DEFAULT_DELETE_BEHAVIOR, DELETE_BEHAVIORS } from '@/constants/delete-behavior'
import {
    DEFAULT_EDITOR_FONT_SIZE,
    DEFAULT_EDITOR_INLINE_TITLE,
    DEFAULT_EDITOR_LINE_NUMBERS,
    DEFAULT_EDITOR_LINE_WIDTH,
    DEFAULT_EDITOR_SPELLCHECK,
    DEFAULT_EDITOR_TAB_SIZE,
    EDITOR_FONT_SIZES,
    EDITOR_LINE_WIDTHS,
    EDITOR_TAB_SIZES,
    EDITOR_TOGGLE
} from '@/constants/editor-display'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'
import { STORAGE_KEYS } from '@/constants/storage-keys'

export const STARTUP_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.STARTUP_BEHAVIOR,
    translationKey: 'startup_behavior',
    values: Object.values(STARTUP_BEHAVIORS),
    defaultValue: STARTUP_BEHAVIORS.LAST_OPENED
}

export const DELETE_BEHAVIOR_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.DELETE_BEHAVIOR,
    translationKey: 'delete_behavior',
    values: Object.values(DELETE_BEHAVIORS),
    defaultValue: DEFAULT_DELETE_BEHAVIOR
}

export const EDITOR_SELECT_OPTIONS = [
    {
        storageKey: STORAGE_KEYS.EDITOR_FONT_SIZE,
        translationKey: 'editor_font_size',
        values: Object.keys(EDITOR_FONT_SIZES),
        defaultValue: DEFAULT_EDITOR_FONT_SIZE
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_LINE_WIDTH,
        translationKey: 'editor_line_width',
        values: Object.keys(EDITOR_LINE_WIDTHS),
        defaultValue: DEFAULT_EDITOR_LINE_WIDTH
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_TAB_SIZE,
        translationKey: 'editor_tab_size',
        values: Object.keys(EDITOR_TAB_SIZES),
        defaultValue: DEFAULT_EDITOR_TAB_SIZE
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_LINE_NUMBERS,
        translationKey: 'editor_line_numbers',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_LINE_NUMBERS
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_SPELLCHECK,
        translationKey: 'editor_spellcheck',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_SPELLCHECK
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_INLINE_TITLE,
        translationKey: 'editor_inline_title',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_INLINE_TITLE
    }
]

export const LAST_EDITOR_SELECT_INDEX = EDITOR_SELECT_OPTIONS.length - 1
