import { buildDerivedColors } from './markdown-dom-derived-colors'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, OPACITY, INLINE_CODE_STYLE } from '@/constants/theme'
import {
    PREVIEW_TABLE_SCROLL_CLASS,
    TABLE_BLEED,
    TABLE_CELL_MAX_WIDTH,
    TABLE_CELL_MIN_WIDTH
} from '@/constants/table-widget'
import {
    CALLOUT_CLASS,
    CALLOUT_COLORS,
    CALLOUT_TITLE_CLASS,
    CALLOUT_TYPE_CLASS_PREFIX
} from '@/constants/callouts'
import { EMBED_CLASS, EMBED_TITLE_CLASS, EMBED_OPEN_CLASS } from '@/constants/embeds'
import { FILE_LINK_CLASS } from '@/constants/file-links'
import { BLOCK_HIGHLIGHT_CLASS } from '@/constants/block-refs'
import { ATTACH_FILE_ICON_PATH } from '@/constants/icon-paths'
import { HEADING_SCALE } from '@/constants/headings'
import { buildIconMaskUrl } from '@/utils/icon-mask'
import {
    BACKLINKS_CLASS,
    BACKLINKS_TITLE_CLASS,
    BACKLINK_TITLE_CLASS,
    BACKLINK_PATH_CLASS,
    MENTIONS_CLASS,
    MENTION_ROW_CLASS,
    MENTION_ACTION_CLASS
} from '@/constants/backlinks'
import {
    CUSTOM_TASK_BOX_MARGIN,
    CUSTOM_TASK_BOX_RADIUS,
    CUSTOM_TASK_BOX_SIZE,
    CUSTOM_TASK_GLYPH_SIZE,
    CUSTOM_TASK_STATUS_ATTRIBUTE
} from '@/constants/tasks'

const ATTACH_FILE_MASK = buildIconMaskUrl(ATTACH_FILE_ICON_PATH)

const buildHeadingSizeCss = (fontSize) => HEADING_SCALE
    .map((scale, index) => `.markdown-preview h${index + 1} { font-size: ${fontSize * scale}px; }`)
    .join('\n    ')

const buildCalloutCss = () => Object.entries(CALLOUT_COLORS).map(([type, color]) => `
    .markdown-preview .${CALLOUT_TYPE_CLASS_PREFIX}${type} {
        border-left-color: ${color}; background-color: ${color + TRANSPARENT[10]};
    }
    .markdown-preview .${CALLOUT_TYPE_CLASS_PREFIX}${type} .${CALLOUT_TITLE_CLASS} { color: ${color}; }`).join('')

export const buildPreviewCss = ({ colors, typography }) => {
    const {
        onBackground: textColor,
        tertiary: linkColor,
        background: quoteBackgroundColor,
        codeBackground: codeBackgroundColor,
        thematicBreak: thematicBreakColor,
        surface: surfaceColor
    } = buildDerivedColors(colors)
    const { fontSize, fontFamily, headingFontFamily } = typography

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
    ${buildHeadingSizeCss(fontSize)}
    .markdown-preview p { margin: 0.4em 0; }
    .markdown-preview .${BLOCK_HIGHLIGHT_CLASS} {
        background-color: ${linkColor + TRANSPARENT[20]}; border-radius: ${RADIUS.sm}px;
        transition: background-color 400ms ease;
    }
    .markdown-preview a { color: ${linkColor}; text-decoration: underline; }
    .markdown-preview .wiki-link { color: ${linkColor}; text-decoration: underline; font-weight: bold; }
    .markdown-preview .tag { color: ${linkColor}; text-decoration: none; font-weight: bold; }
    .markdown-preview .${FILE_LINK_CLASS} {
        display: inline-block; padding: 0 8px; border-radius: ${RADIUS.sm}px; text-decoration: none;
        color: ${textColor}; background-color: ${surfaceColor}; border: 1px solid ${textColor + TRANSPARENT[5]};
    }
    .markdown-preview .${FILE_LINK_CLASS}::before {
        content: ''; display: inline-block; width: 1em; height: 1em; margin-right: 2px; vertical-align: -0.2em;
        background-color: currentColor; opacity: ${OPACITY.secondary}; -webkit-mask: ${ATTACH_FILE_MASK} center / contain no-repeat;
        mask: ${ATTACH_FILE_MASK} center / contain no-repeat;
    }
    .markdown-preview .wiki-link-broken { color: ${textColor}; opacity: ${OPACITY.muted}; text-decoration: underline dashed; }
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
    .markdown-preview .${EMBED_TITLE_CLASS} {
        display: flex; align-items: center; justify-content: space-between; gap: 0.5em;
        font-weight: bold; font-size: 0.85em; margin-top: 0.4em;
    }
    .markdown-preview .${EMBED_TITLE_CLASS} > span { opacity: ${OPACITY.secondary}; }
    .markdown-preview a.${EMBED_OPEN_CLASS} { display: inline-flex; padding: 0.3em; font-size: 1.2em; color: inherit; opacity: ${OPACITY.secondary}; }
    .markdown-preview code {
        background-color: ${codeBackgroundColor}; border-radius: ${INLINE_CODE_STYLE.borderRadius}; padding: ${INLINE_CODE_STYLE.padding};
        font-family: monospace;
    }
    .markdown-preview pre { background-color: ${codeBackgroundColor}; border-radius: 8px; padding: 0.8em; overflow-x: auto; max-width: 100%; }
    .markdown-preview pre code { background-color: transparent; padding: 0; }
    .markdown-preview ul, .markdown-preview ol { padding-left: 1.4em; margin: 0.4em 0; list-style-position: inside; }
    .markdown-preview li.task-list-item { list-style: none; margin-left: -1.4em; }
    .markdown-preview input[type="checkbox"] { accent-color: ${linkColor}; margin-right: 0.4em; }
    .markdown-preview input.task-list-item-checkbox[${CUSTOM_TASK_STATUS_ATTRIBUTE}] {
        appearance: none; -webkit-appearance: none; box-sizing: border-box; vertical-align: middle;
        width: ${CUSTOM_TASK_BOX_SIZE}; height: ${CUSTOM_TASK_BOX_SIZE}; border-radius: ${CUSTOM_TASK_BOX_RADIUS};
        margin: ${CUSTOM_TASK_BOX_MARGIN}; background-color: ${linkColor}; padding: 0;
    }
    .markdown-preview input.task-list-item-checkbox[${CUSTOM_TASK_STATUS_ATTRIBUTE}]::before {
        content: attr(${CUSTOM_TASK_STATUS_ATTRIBUTE}); display: block; text-align: center; font-weight: bold;
        font-size: ${CUSTOM_TASK_GLYPH_SIZE}; line-height: ${CUSTOM_TASK_BOX_SIZE}; color: ${colors.background};
    }
    .markdown-preview img { max-width: 100%; object-fit: contain; border-radius: 8px; }
    .markdown-preview hr { border: none; border-top: 1px solid ${thematicBreakColor}; margin: 16px 0; }
    .markdown-preview .${PREVIEW_TABLE_SCROLL_CLASS} {
        overflow-x: auto; margin: 0.6em -${TABLE_BLEED}px; padding: 0 ${TABLE_BLEED}px;
    }
    .markdown-preview table {
        border-collapse: collapse; width: max-content; min-width: 100%; margin: 0; overflow-wrap: normal;
    }
    .markdown-preview th, .markdown-preview td {
        border: 1px solid ${textColor + TRANSPARENT[20]}; padding: 6px 10px; vertical-align: top;
        min-width: ${TABLE_CELL_MIN_WIDTH}px; max-width: ${TABLE_CELL_MAX_WIDTH}px; overflow-wrap: break-word;
    }
    .markdown-preview .katex-display { overflow-x: auto; margin: 0.6em 0; }
    .markdown-preview .footnote-ref a, .markdown-preview .footnote-backref { color: ${linkColor}; }
    .markdown-preview .footnotes-sep { border: none; border-top: 1px solid ${thematicBreakColor}; margin: 16px 0; }
    .markdown-preview .footnotes { font-size: 0.85em; opacity: ${OPACITY.strong}; }
    .markdown-preview .footnote-item > p { display: inline; }
    .markdown-preview .${BACKLINKS_CLASS} {
        margin: 32px 0 16px; padding: 8px 0; overflow: hidden; border-radius: 16px;
        background-color: ${surfaceColor}; font-size: 13px; line-height: 1.3;
    }
    .markdown-preview .${BACKLINKS_TITLE_CLASS} {
        padding: 12px 16px 4px; font-size: 10px; font-weight: 600; letter-spacing: 0.08em;
        text-transform: uppercase; opacity: ${OPACITY.secondary};
    }
    .markdown-preview .${BACKLINKS_CLASS} ul { list-style: none; padding: 0; margin: 0; }
    .markdown-preview .${BACKLINKS_CLASS} li { margin: 0; }
    .markdown-preview .${BACKLINKS_CLASS} .wiki-link {
        position: relative; display: block; padding: 8px 36px 8px 16px;
        color: ${textColor}; font-weight: normal; text-decoration: none;
    }
    .markdown-preview .${BACKLINKS_CLASS} .wiki-link::after {
        content: '\\203A'; position: absolute; right: 16px; top: 50%; transform: translateY(-50%);
        font-size: 20px; opacity: ${OPACITY.disabled};
    }
    .markdown-preview .${BACKLINK_TITLE_CLASS} { display: block; font-weight: 600; }
    .markdown-preview .${BACKLINK_PATH_CLASS} { display: block; margin-top: 1px; font-size: 11px; opacity: ${OPACITY.secondary}; }
    .markdown-preview .${MENTIONS_CLASS} { margin-top: 0; }
    .markdown-preview .${MENTION_ROW_CLASS} { display: flex; align-items: center; padding-right: 16px; }
    .markdown-preview .${MENTIONS_CLASS} .wiki-link { flex: 1; min-width: 0; padding-right: 8px; }
    .markdown-preview .${MENTIONS_CLASS} .wiki-link::after { display: none; }
    .markdown-preview .${MENTION_ACTION_CLASS} {
        padding: 6px 12px; border-radius: 999px; background-color: ${codeBackgroundColor};
        color: ${linkColor}; font-size: 12px; font-weight: 600; text-decoration: none;
    }
`
}

