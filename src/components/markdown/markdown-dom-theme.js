import { EditorView } from '@codemirror/view'
import { buildLiveFormattingTheme } from './markdown-dom-live-formatting'
import { FONT_FAMILY_NAMES } from './markdown-dom-fonts'

export const buildTitleSectionStyle = () => ({
    paddingLeft: '16px',
    paddingRight: '16px',
    paddingTop: '16px'
})

export const buildTitleTextareaStyle = ({ fontFamily, textColor }) => ({
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
    color: textColor,
    padding: 0,
    margin: 0
})

export const buildDateLabelStyle = ({ textColor }) => ({
    marginTop: 8,
    marginBottom: 16,
    fontSize: '9px',
    textTransform: 'uppercase',
    opacity: 0.5,
    color: textColor,
    fontFamily: `'${FONT_FAMILY_NAMES.body}', ui-monospace, monospace`
})

export const buildEditorTheme = ({
    fontSize,
    fontFamily,
    textColor,
    cursorColor,
    selectionColor,
    placeholderColor,
    linkColor,
    codeBackgroundColor
}) => EditorView.theme({
    '&': { height: '100%', fontSize: `${fontSize}px`, backgroundColor: 'transparent' },
    '.cm-content': {
        fontFamily, color: textColor, caretColor: cursorColor, overflowWrap: 'anywhere',
        paddingLeft: '16px', paddingRight: '16px', paddingTop: '8px'
    },
    '.cm-line': { overflowWrap: 'anywhere', wordBreak: 'break-word' },
    '.cm-scroller': {
        overflowY: 'auto', overflowX: 'hidden', fontFamily,
        WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none'
    },
    '.cm-scroller::-webkit-scrollbar': { display: 'none' },
    '.cm-selectionBackground': { backgroundColor: `${selectionColor} !important` },
    '.cm-gutters': { display: 'none' },
    '&.cm-focused': { outline: 'none' },
    '.cm-placeholder': { color: placeholderColor },
    ...buildLiveFormattingTheme({ linkColor, codeBackgroundColor })
})

export const buildPreviewCss = ({
    fontFamily,
    headingFontFamily,
    textColor,
    linkColor,
    quoteBackgroundColor,
    codeBackgroundColor,
    thematicBreakColor,
    fontSize
}) => `
    html, body { margin: 0; overflow-x: hidden; scrollbar-width: none; }
    ::-webkit-scrollbar { display: none; }
    .markdown-preview {
        font-family: ${fontFamily}; color: ${textColor}; font-size: ${fontSize}px; line-height: 1.6;
        overflow-wrap: anywhere; padding: 8px 16px 16px;
    }
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
    .markdown-preview blockquote {
        margin: 0.4em 0; padding: 0.2em 0.8em;
        background-color: ${quoteBackgroundColor}; border-left: 4px solid ${linkColor};
    }
    .markdown-preview code {
        background-color: ${codeBackgroundColor}; border-radius: 4px; padding: 0.1em 0.3em;
        font-family: monospace;
    }
    .markdown-preview pre { background-color: ${codeBackgroundColor}; border-radius: 8px; padding: 0.8em; overflow-x: auto; max-width: 100%; }
    .markdown-preview pre code { background-color: transparent; padding: 0; }
    .markdown-preview ul, .markdown-preview ol { padding-left: 1.4em; margin: 0.4em 0; }
    .markdown-preview li.task-list-item { list-style: none; margin-left: -1.4em; }
    .markdown-preview input[type="checkbox"] { accent-color: ${linkColor}; margin-right: 0.4em; }
    .markdown-preview img { max-width: 100%; object-fit: contain; border-radius: 8px; }
    .markdown-preview hr { border: none; border-top: 1px solid ${thematicBreakColor}; margin: 16px 0; }
`
