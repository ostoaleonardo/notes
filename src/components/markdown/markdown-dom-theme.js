import { EditorView } from '@codemirror/view'

import { buildLiveFormattingTheme } from './live-formatting/live-formatting'

import { TRANSPARENT } from '../../constants/themes'
import { SPACING } from '../../constants/spacing'
import { RADIUS } from '../../constants/radius'
import { INLINE_TAG_CLASS } from '../../constants/tags'
import {
    CALLOUT_CLASS,
    CALLOUT_COLORS,
    CALLOUT_TITLE_CLASS,
    CALLOUT_TYPE_CLASS_PREFIX
} from '../../constants/callouts'
import { EMBED_CLASS, EMBED_TITLE_CLASS } from '../../constants/embeds'
import { FILE_LINK_CLASS } from '../../constants/file-links'
import { ATTACH_FILE_ICON_PATH } from '../../constants/icon-paths'
import { buildIconMaskUrl } from '../../utils/icon-mask'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    BACKLINK_TITLE_CLASS,
    BACKLINK_PATH_CLASS
} from '../../constants/backlinks'

const ATTACH_FILE_MASK = buildIconMaskUrl(ATTACH_FILE_ICON_PATH)

const buildDerivedColors = (colors) => ({
    ...colors,
    selection: colors.tertiary + TRANSPARENT[20],
    placeholder: colors.onBackground + TRANSPARENT[40],
    codeBackground: colors.onBackground + TRANSPARENT[10],
    thematicBreak: colors.tertiary + TRANSPARENT[30]
})

export const buildTitleSectionStyle = () => ({
    boxSizing: 'border-box',
    width: '100%',
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px'
})

export const buildTitleTextareaStyle = ({ fontFamily, onBackground }) => ({
    display: 'block',
    width: '100%',
    resize: 'none',
    overflow: 'hidden',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontFamily,
    fontSize: '24px',
    fontWeight: 'bold',
    color: onBackground,
    padding: 0,
    margin: 0
})

export const buildMetaLabelStyle = ({ onBackground, fontFamily }) => ({
    marginTop: SPACING.sm,
    marginBottom: SPACING.lg,
    fontSize: '9px',
    textTransform: 'uppercase',
    opacity: 0.5,
    color: onBackground,
    fontFamily
})

export const buildPropertiesToggleStyle = ({ onBackground }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    marginTop: SPACING.xxs,
    marginBottom: SPACING.sm,
    fontSize: '10px',
    textTransform: 'uppercase',
    opacity: 0.5,
    color: onBackground,
    cursor: 'pointer',
    userSelect: 'none',
    width: 'fit-content'
})

export const buildPropertyRowStyle = ({ onBackground }) => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    marginBottom: SPACING.lg,
    fontSize: '13px',
    color: onBackground
})

export const buildChipStyle = ({ tertiary, fontFamily }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    height: '22px',
    padding: '0 8px',
    boxSizing: 'border-box',
    borderRadius: '999px',
    backgroundColor: tertiary + TRANSPARENT[20],
    color: tertiary,
    fontFamily,
    fontSize: '13px',
    lineHeight: '13px',
    cursor: 'pointer'
})

export const buildPropertiesCardStyle = ({ surface, onBackground }) => ({
    display: 'flex',
    flexDirection: 'column',
    gap: SPACING.xxs,
    padding: SPACING.sm,
    marginBottom: SPACING.lg,
    borderRadius: '8px',
    backgroundColor: surface,
    border: `1px solid ${onBackground + TRANSPARENT[5]}`,
    color: onBackground
})

export const buildPropertyEntryStyle = () => ({
    display: 'flex',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    minHeight: '32px',
    position: 'relative'
})

export const buildPropertyNameStyle = ({ fill = false } = {}) => ({
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    flex: fill ? 1 : '0 0 30%',
    minHeight: '32px',
    minWidth: 0
})

export const buildPropertyValueStyle = () => ({
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
    flex: 1,
    boxSizing: 'border-box',
    minHeight: '32px',
    padding: '5px 0',
    minWidth: 0
})

export const buildPropertyInputStyle = ({ onBackground, fontFamily, opacity = 1 }) => ({
    flex: 1,
    minWidth: 0,
    width: '100%',
    border: 'none',
    outline: 'none',
    background: 'transparent',
    padding: 0,
    margin: 0,
    fontFamily,
    fontSize: '13px',
    color: onBackground,
    opacity
})

export const buildPropertyIconButtonStyle = ({ onBackground, opacity = 0.6 }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    width: '20px',
    height: '20px',
    padding: 0,
    border: 'none',
    background: 'transparent',
    color: onBackground,
    opacity,
    cursor: 'pointer'
})

export const buildPropertyAddButtonStyle = ({ onBackground, fontFamily }) => ({
    display: 'inline-flex',
    alignItems: 'center',
    gap: SPACING.xs,
    width: 'fit-content',
    padding: '4px 0',
    border: 'none',
    background: 'transparent',
    fontFamily,
    fontSize: '13px',
    color: onBackground,
    opacity: 0.6,
    cursor: 'pointer'
})

export const buildPropertyMenuStyle = ({ surface, onBackground }) => ({
    position: 'absolute',
    top: '100%',
    left: 0,
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    minWidth: '200px',
    maxHeight: '220px',
    overflowY: 'auto',
    padding: SPACING.xs,
    borderRadius: `${RADIUS.outer}px`,
    backgroundColor: surface,
    border: `1px solid ${onBackground + TRANSPARENT[5]}`
})

export const buildPropertyMenuItemStyle = ({ onBackground, fontFamily }) => ({
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
    padding: '6px 8px',
    borderRadius: '6px',
    fontFamily,
    fontSize: '13px',
    color: onBackground,
    cursor: 'pointer'
})

export const buildInvalidPropertiesBannerStyle = ({ errorContainer, onErrorContainer, fontFamily }) => ({
    padding: '12px',
    borderRadius: '8px',
    marginBottom: SPACING.lg,
    backgroundColor: errorContainer,
    color: onErrorContainer,
    fontFamily
})

export const buildInvalidPropertiesTitleStyle = () => ({
    fontSize: '13px',
    fontWeight: 'bold'
})

export const buildInvalidPropertiesDescriptionStyle = () => ({
    fontSize: '12px',
    opacity: 0.8,
    marginTop: 2
})

export const buildEditorTheme = ({ fontSize, fontFamily, headingFontFamily, colors }) => {
    const { onBackground, tertiary, selection, placeholder, background, codeBackground, thematicBreak, surface } = buildDerivedColors(colors)

    return EditorView.theme({
        '&': { height: '100%', fontSize: `${fontSize}px`, backgroundColor: 'transparent' },
        '.cm-content': {
            fontFamily, color: onBackground, caretColor: tertiary, overflowWrap: 'anywhere',
            paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px'
        },
        '.cm-line': { overflowWrap: 'anywhere', padding: 0 },
        '.cm-scroller': {
            overflowY: 'auto', overflowX: 'hidden', fontFamily,
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
            backgroundColor: surface, border: 'none', borderRadius: '8px', overflow: 'hidden'
        },
        '.cm-tooltip-autocomplete ul': { fontFamily, color: onBackground },
        '.cm-tooltip-autocomplete ul li': { padding: '8px 0 !important' },
        '.cm-tooltip-autocomplete ul li[aria-selected]': { backgroundColor: `${tertiary}30`, color: onBackground },
        '.cm-completionDetail': {
            display: 'block', fontStyle: 'normal', opacity: 0.5, fontSize: '0.85em', marginTop: '2px'
        },
        '.cm-foldPlaceholder': {
            backgroundColor: `${surface} !important`, border: 'none !important',
            color: `${tertiary} !important`, borderRadius: '4px', padding: '0 6px', fontFamily
        },
        ...buildLiveFormattingTheme({
            linkColor: tertiary,
            surfaceColor: surface,
            quoteBackgroundColor: background,
            codeBackgroundColor: codeBackground,
            thematicBreakColor: thematicBreak,
            onBackgroundColor: onBackground,
            headingFontFamily
        })
    })
}

const buildCalloutCss = () => Object.entries(CALLOUT_COLORS).map(([type, color]) => `
    .markdown-preview .${CALLOUT_TYPE_CLASS_PREFIX}${type} {
        border-left-color: ${color}; background-color: ${color + TRANSPARENT[10]};
    }
    .markdown-preview .${CALLOUT_TYPE_CLASS_PREFIX}${type} .${CALLOUT_TITLE_CLASS} { color: ${color}; }`).join('')

export const buildPreviewCss = ({ fontFamily, headingFontFamily, colors, fontSize }) => {
    const { onBackground: textColor, tertiary: linkColor, background: quoteBackgroundColor, codeBackground: codeBackgroundColor, thematicBreak: thematicBreakColor, surface: surfaceColor } = buildDerivedColors(colors)

    return `
    html, body { margin: 0; overflow-x: hidden; scrollbar-width: none; }
    ::-webkit-scrollbar { display: none; }
    .markdown-preview {
        font-family: ${fontFamily}; color: ${textColor}; font-size: ${fontSize}px; line-height: 1.6;
        overflow-wrap: anywhere; padding-top: 8px; padding-right: 16px; padding-bottom: 16px; padding-left: 16px;
    }
    .markdown-preview > *:first-child { margin-top: 0; }
    .markdown-preview h1, .markdown-preview h2, .markdown-preview h3,
    .markdown-preview h4, .markdown-preview h5, .markdown-preview h6 {
        font-family: ${headingFontFamily}; color: ${textColor}; margin: 0.6em 0 0.3em; font-weight: bold;
    }
    .markdown-preview h1 { font-size: ${fontSize * 2}px; }
    .markdown-preview h2 { font-size: ${fontSize * 1.8}px; }
    .markdown-preview h3 { font-size: ${fontSize * 1.6}px; }
    .markdown-preview h4 { font-size: ${fontSize * 1.5}px; }
    .markdown-preview h5 { font-size: ${fontSize * 1.4}px; }
    .markdown-preview h6 { font-size: ${fontSize * 1.2}px; }
    .markdown-preview p { margin: 0.4em 0; }
    .markdown-preview a { color: ${linkColor}; text-decoration: underline; }
    .markdown-preview .wiki-link { color: ${linkColor}; text-decoration: underline; font-weight: bold; }
    .markdown-preview .tag { color: ${linkColor}; text-decoration: none; font-weight: bold; }
    .markdown-preview .${FILE_LINK_CLASS} {
        display: inline-block; padding: 0 8px; border-radius: ${RADIUS.segment}px; text-decoration: none;
        color: ${textColor}; background-color: ${surfaceColor}; border: 1px solid ${textColor + TRANSPARENT[5]};
    }
    .markdown-preview .${FILE_LINK_CLASS}::before {
        content: ''; display: inline-block; width: 1em; height: 1em; margin-right: 2px; vertical-align: -0.2em;
        background-color: currentColor; opacity: 0.6; -webkit-mask: ${ATTACH_FILE_MASK} center / contain no-repeat;
        mask: ${ATTACH_FILE_MASK} center / contain no-repeat;
    }
    .markdown-preview .wiki-link-broken { color: ${textColor}; opacity: 0.5; text-decoration: underline dashed; }
    .markdown-preview blockquote {
        margin: 0.4em 0; padding: 0.2em 0.8em;
        background-color: ${quoteBackgroundColor}; border-left: 4px solid ${linkColor};
    }
    .markdown-preview mark { background-color: ${linkColor + TRANSPARENT[30]}; color: inherit; border-radius: 2px; }
    .markdown-preview > div, .markdown-preview > details { margin: 0.6em 0; }
    .markdown-preview .${CALLOUT_CLASS} {
        margin: 0.6em 0; padding: 0.6em 0.8em; border-left: 4px solid ${linkColor}; border-radius: 4px;
    }
    .markdown-preview .${CALLOUT_TITLE_CLASS} { font-weight: bold; }
    .markdown-preview .${CALLOUT_CLASS} > :last-child { margin-bottom: 0; }
    .markdown-preview summary.${CALLOUT_TITLE_CLASS} { cursor: pointer; }
    .markdown-preview .${CALLOUT_CLASS} > .${CALLOUT_TITLE_CLASS} + * { margin-top: 0.4em; }
    ${buildCalloutCss()}
    .markdown-preview .${EMBED_CLASS} {
        margin: 0.6em 0; padding: 0.2em 0.8em; border-left: 2px solid ${thematicBreakColor};
        background-color: ${quoteBackgroundColor};
    }
    .markdown-preview .${EMBED_TITLE_CLASS} { font-weight: bold; opacity: 0.6; font-size: 0.85em; margin-top: 0.4em; }
    .markdown-preview code {
        background-color: ${codeBackgroundColor}; border-radius: 4px; padding: 0.1em 0.3em;
        font-family: monospace;
    }
    .markdown-preview pre { background-color: ${codeBackgroundColor}; border-radius: 8px; padding: 0.8em; overflow-x: auto; max-width: 100%; }
    .markdown-preview pre code { background-color: transparent; padding: 0; }
    .markdown-preview ul, .markdown-preview ol { padding-left: 1.4em; margin: 0.4em 0; list-style-position: inside; }
    .markdown-preview li.task-list-item { list-style: none; margin-left: -1.4em; }
    .markdown-preview input[type="checkbox"] { accent-color: ${linkColor}; margin-right: 0.4em; }
    .markdown-preview img { max-width: 100%; object-fit: contain; border-radius: 8px; }
    .markdown-preview hr { border: none; border-top: 1px solid ${thematicBreakColor}; margin: 16px 0; }
    .markdown-preview table { border-collapse: collapse; margin: 0.4em 0; overflow-x: auto; display: block; }
    .markdown-preview th, .markdown-preview td { border: 1px solid ${codeBackgroundColor}; padding: 4px 8px; }
    .markdown-preview .katex-display { overflow-x: auto; margin: 0.6em 0; }
    .markdown-preview .footnote-ref a, .markdown-preview .footnote-backref { color: ${linkColor}; }
    .markdown-preview .footnotes-sep { border: none; border-top: 1px solid ${thematicBreakColor}; margin: 16px 0; }
    .markdown-preview .footnotes { font-size: 0.85em; opacity: 0.85; }
    .markdown-preview .footnote-item > p { display: inline; }
    .markdown-preview .${BACKLINKS_CLASS} {
        margin: 32px 0 16px; padding: 8px 0; overflow: hidden; border-radius: 16px;
        background-color: ${surfaceColor}; font-size: 13px; line-height: 1.3;
    }
    .markdown-preview .${BACKLINKS_TITLE_CLASS} {
        padding: 12px 16px 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
        text-transform: uppercase; opacity: 0.6;
    }
    .markdown-preview .${BACKLINKS_CLASS} ul { list-style: none; padding: 0; margin: 0; }
    .markdown-preview .${BACKLINKS_CLASS} li { margin: 0; }
    .markdown-preview .${BACKLINKS_CLASS} .wiki-link {
        position: relative; display: block; padding: 8px 36px 8px 16px;
        color: ${textColor}; font-weight: normal; text-decoration: none;
    }
    .markdown-preview .${BACKLINKS_CLASS} .wiki-link::after {
        content: '\\203A'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        font-size: 20px; opacity: 0.4;
    }
    .markdown-preview .${BACKLINK_TITLE_CLASS} { display: block; font-weight: 600; }
    .markdown-preview .${BACKLINK_PATH_CLASS} { display: block; margin-top: 1px; font-size: 11px; opacity: 0.6; }
`
}
