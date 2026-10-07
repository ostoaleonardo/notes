import { EditorView } from '@codemirror/view'

import { buildDerivedColors } from './markdown-dom-derived-colors'
import { buildLiveFormattingTheme } from './live-formatting/live-formatting'

import { RADIUS, OPACITY } from '@/constants/theme'
import { INLINE_TAG_CLASS } from '@/constants/tags'
import { TRANSPARENT } from '@/constants/themes'

export const buildEditorTheme = ({ colors, typography }) => {
    const derived = buildDerivedColors(colors)
    const { onBackground, tertiary, selection, placeholder, surface } = derived
    const { fontSize, fontFamily } = typography

    return EditorView.theme({
        '&': { width: '100%', fontSize: `${fontSize}px`, backgroundColor: 'transparent' },
        '.cm-content': {
            fontFamily, color: onBackground, caretColor: tertiary, overflowWrap: 'anywhere',
            paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px'
        },
        '.cm-line': { overflowWrap: 'anywhere', padding: 0 },
        '.cm-scroller': {
            overflowY: 'visible', overflowX: 'hidden', fontFamily,
            WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
        },
        '.cm-scroller::-webkit-scrollbar': { display: 'none' },
        '.cm-selectionBackground': { backgroundColor: `${selection} !important` },
        '.cm-gutters': { display: 'none' },
        '&.cm-focused': { outline: 'none' },
        '.cm-placeholder': { color: placeholder },
        [`.${INLINE_TAG_CLASS}`]: { color: tertiary, fontWeight: 'bold' },
        '.cm-searchMatch': { backgroundColor: `${tertiary}40 !important` },
        '.cm-searchMatch-selected': { backgroundColor: `${tertiary}80 !important` },
        '.cm-tooltip.cm-tooltip-autocomplete': {
            backgroundColor: surface,
            border: `1px solid ${onBackground + TRANSPARENT[5]}`,
            borderRadius: `${RADIUS.lg}px`,
            overflow: 'hidden'
        },
        '.cm-tooltip-autocomplete ul': { fontFamily, color: onBackground },
        '.cm-tooltip-autocomplete ul li': { padding: '8px 0 !important' },
        '.cm-tooltip-autocomplete ul li[aria-selected]': {
            backgroundColor: onBackground + TRANSPARENT[10],
            color: onBackground
        },
        '.cm-completionDetail': {
            display: 'block', fontStyle: 'normal', opacity: OPACITY.muted, fontSize: '0.85em', marginTop: '2px'
        },
        '.cm-foldPlaceholder': {
            backgroundColor: `${surface} !important`, border: 'none !important',
            color: `${tertiary} !important`, borderRadius: '4px', padding: '0 6px', fontFamily
        },
        ...buildLiveFormattingTheme({ colors: derived, typography })
    })
}
