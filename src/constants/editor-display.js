import { STORAGE_KEYS } from '@/constants/storage-keys'

export const EDITOR_FONT_SIZES = {
    small: 12,
    default: 13,
    large: 15,
    extra_large: 17
}

export const EDITOR_LINE_WIDTHS = {
    full: 'none',
    wide: '900px',
    narrow: '680px'
}

export const DEFAULT_EDITOR_FONT_SIZE = 'default'
export const DEFAULT_EDITOR_LINE_WIDTH = 'full'

export const EDITOR_TOGGLE = {
    on: true,
    off: false
}

export const EDITOR_TAB_SIZES = {
    2: 2,
    4: 4,
    8: 8
}

const DEFAULT_EDITOR_LINE_NUMBERS = 'off'
const DEFAULT_EDITOR_SPELLCHECK = 'on'
const DEFAULT_EDITOR_AUTOCORRECT = 'on'
export const DEFAULT_EDITOR_TAB_SIZE = '4'
const DEFAULT_EDITOR_INLINE_TITLE = 'on'

export const EDITOR_DISPLAY_OPTIONS = [
    {
        name: 'fontSize',
        storageKey: STORAGE_KEYS.EDITOR_FONT_SIZE,
        translationKey: 'settings.editor.font_size',
        options: EDITOR_FONT_SIZES,
        defaultValue: DEFAULT_EDITOR_FONT_SIZE
    },
    {
        name: 'maxWidth',
        storageKey: STORAGE_KEYS.EDITOR_LINE_WIDTH,
        translationKey: 'settings.editor.line_width',
        options: EDITOR_LINE_WIDTHS,
        defaultValue: DEFAULT_EDITOR_LINE_WIDTH
    },
    {
        name: 'tabSize',
        storageKey: STORAGE_KEYS.EDITOR_TAB_SIZE,
        translationKey: 'settings.editor.tab_size',
        options: EDITOR_TAB_SIZES,
        translateValues: false,
        defaultValue: DEFAULT_EDITOR_TAB_SIZE
    },
    {
        name: 'lineNumbers',
        storageKey: STORAGE_KEYS.EDITOR_LINE_NUMBERS,
        translationKey: 'settings.editor.line_numbers',
        options: EDITOR_TOGGLE,
        toggle: true,
        defaultValue: DEFAULT_EDITOR_LINE_NUMBERS
    },
    {
        name: 'spellcheck',
        storageKey: STORAGE_KEYS.EDITOR_SPELLCHECK,
        translationKey: 'settings.editor.spellcheck',
        options: EDITOR_TOGGLE,
        toggle: true,
        defaultValue: DEFAULT_EDITOR_SPELLCHECK
    },
    {
        name: 'autocorrect',
        storageKey: STORAGE_KEYS.EDITOR_AUTOCORRECT,
        translationKey: 'settings.editor.autocorrect',
        options: EDITOR_TOGGLE,
        toggle: true,
        defaultValue: DEFAULT_EDITOR_AUTOCORRECT
    },
    {
        name: 'inlineTitle',
        storageKey: STORAGE_KEYS.EDITOR_INLINE_TITLE,
        translationKey: 'settings.editor.inline_title',
        options: EDITOR_TOGGLE,
        toggle: true,
        defaultValue: DEFAULT_EDITOR_INLINE_TITLE
    }
]
