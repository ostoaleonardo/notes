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

const STARTUP_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.STARTUP_BEHAVIOR,
    translationKey: 'settings.notes.startup',
    values: Object.values(STARTUP_BEHAVIORS),
    defaultValue: STARTUP_BEHAVIORS.LAST_OPENED
}

const DELETE_BEHAVIOR_SELECT_OPTION = {
    storageKey: STORAGE_KEYS.DELETE_BEHAVIOR,
    translationKey: 'settings.notes.delete',
    values: Object.values(DELETE_BEHAVIORS),
    defaultValue: DEFAULT_DELETE_BEHAVIOR
}

export const NOTES_SELECT_OPTIONS = [STARTUP_SELECT_OPTION, DELETE_BEHAVIOR_SELECT_OPTION]

export const EDITOR_SELECT_OPTIONS = [
    {
        storageKey: STORAGE_KEYS.EDITOR_FONT_SIZE,
        translationKey: 'settings.editor.font_size',
        values: Object.keys(EDITOR_FONT_SIZES),
        defaultValue: DEFAULT_EDITOR_FONT_SIZE
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_LINE_WIDTH,
        translationKey: 'settings.editor.line_width',
        values: Object.keys(EDITOR_LINE_WIDTHS),
        defaultValue: DEFAULT_EDITOR_LINE_WIDTH
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_TAB_SIZE,
        translationKey: 'settings.editor.tab_size',
        values: Object.keys(EDITOR_TAB_SIZES),
        translateValues: false,
        defaultValue: DEFAULT_EDITOR_TAB_SIZE
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_LINE_NUMBERS,
        translationKey: 'settings.editor.line_numbers',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_LINE_NUMBERS
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_SPELLCHECK,
        translationKey: 'settings.editor.spellcheck',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_SPELLCHECK
    },
    {
        storageKey: STORAGE_KEYS.EDITOR_INLINE_TITLE,
        translationKey: 'settings.editor.inline_title',
        values: Object.keys(EDITOR_TOGGLE),
        defaultValue: DEFAULT_EDITOR_INLINE_TITLE
    }
]
