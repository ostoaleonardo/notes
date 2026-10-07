import { EditorSelection } from '@codemirror/state'
import { indentLess, indentMore, redo, undo } from '@codemirror/commands'
import { findNext, findPrevious, replaceAll, replaceNext } from '@codemirror/search'
import { toggleFold } from '@codemirror/language'
import { snippet } from '@codemirror/autocomplete'

import { LIST_MARKERS, LIST_TYPES, WRAP_MARKERS, LEADING_WHITESPACE_PATTERN } from '@/constants/markdown-patterns'
import { HEADING_LINE_PATTERN, HEADING_MARKER_PATTERN } from '@/constants/headings'
import { MARKDOWN_ACTIONS, HEADING_ACTION_LEVELS } from '@/constants/markdown-actions'
import { QUOTE_PREFIX, QUOTE_MARKER, HORIZONTAL_RULE, LINK_URL_PLACEHOLDER } from '@/constants/markdown-syntax'
import { DEFAULT_TABLE_SIZE } from '@/constants/table'

const insertWikiLinkSnippet = snippet('[[${}]]')

const buildTableTemplate = (cols, rows) => {
    const header = Array.from({ length: cols }, (_, c) => `\${Column ${c + 1}}`).join(' | ')
    const separator = Array(cols).fill('---').join(' | ')
    const bodyLines = Array.from({ length: rows }, (_, r) => (
        Array.from({ length: cols }, (_, c) => `\${Cell ${r * cols + c + 1}}`).join(' | ')
    ))

    return [`| ${header} |`, `| ${separator} |`, ...bodyLines.map((line) => `| ${line} |`)].join('\n')
}

const currentLine = (view) => view.state.doc.lineAt(view.state.selection.main.head)

const toggleWrap = (view, chars) => {
    const { state } = view
    const { from, to } = state.selection.main

    if (from !== to) {
        const before = state.sliceDoc(Math.max(0, from - chars.length), from)
        const after = state.sliceDoc(to, to + chars.length)

        if (before === chars && after === chars) {
            view.dispatch({
                changes: [
                    { from: from - chars.length, to: from, insert: '' },
                    { from: to, to: to + chars.length, insert: '' }
                ],
                selection: EditorSelection.range(from - chars.length, to - chars.length)
            })
        } else {
            view.dispatch({
                changes: [{ from, insert: chars }, { from: to, insert: chars }],
                selection: EditorSelection.range(from + chars.length, to + chars.length)
            })
        }
    } else {
        view.dispatch({
            changes: { from, insert: chars + chars },
            selection: EditorSelection.cursor(from + chars.length)
        })
    }

    view.focus()
}

const replaceLine = (view, transform) => {
    const line = currentLine(view)
    const newText = transform(line.text)

    view.dispatch({
        changes: { from: line.from, to: line.to, insert: newText },
        selection: EditorSelection.cursor(line.from + newText.length)
    })

    view.focus()
}

const toggleHeading = (view, level) => {
    replaceLine(view, (text) => {
        const match = text.match(HEADING_LINE_PATTERN)
        const marker = '#'.repeat(level)

        if (match && match[1] === marker) return match[2]

        const content = match ? match[2] : text
        return `${marker} ${content}`
    })
}

const clearHeading = (view) => {
    replaceLine(view, (text) => text.replace(HEADING_MARKER_PATTERN, ''))
}

const toggleQuote = (view) => {
    replaceLine(view, (text) => {
        if (text.startsWith(QUOTE_PREFIX)) return text.slice(QUOTE_PREFIX.length)
        if (text.startsWith(QUOTE_MARKER)) return text.slice(QUOTE_MARKER.length)
        return `${QUOTE_PREFIX}${text}`
    })
}

const insertHorizontalRule = (view) => {
    const line = currentLine(view)

    if (line.text.trim() === '') {
        view.dispatch({
            changes: { from: line.from, to: line.to, insert: HORIZONTAL_RULE },
            selection: EditorSelection.cursor(line.from + HORIZONTAL_RULE.length)
        })
    } else {
        view.dispatch({
            changes: { from: line.to, insert: `\n${HORIZONTAL_RULE}` },
            selection: EditorSelection.cursor(line.to + 1 + HORIZONTAL_RULE.length)
        })
    }

    view.focus()
}

const insertLineLink = (view, payload, format) => {
    const { title, url } = payload || {}

    replaceLine(view, (text) => format(title && title.trim() !== '' ? title : text, url || LINK_URL_PLACEHOLDER))
}

const insertAtCursor = (view, text) => {
    const { from, to } = view.state.selection.main

    view.dispatch({
        changes: { from, to, insert: text },
        selection: EditorSelection.cursor(from + text.length)
    })

    view.focus()
}

const insertWikiLink = (view) => {
    const { from, to } = view.state.selection.main

    insertWikiLinkSnippet(view, null, from, to)
    view.focus()
}

const insertTable = (view, payload) => {
    const { cols = DEFAULT_TABLE_SIZE.cols, rows = DEFAULT_TABLE_SIZE.rows } = payload || {}
    const { doc, selection } = view.state
    const line = doc.lineAt(selection.main.head)
    const nextLine = line.number < doc.lines ? doc.line(line.number + 1) : null
    const suffix = nextLine && nextLine.text.trim() !== '' ? '\n' : ''
    const template = buildTableTemplate(cols, rows) + suffix

    if (line.text.trim() === '') {
        snippet(template)(view, null, line.from, line.to)
    } else {
        snippet(`\n\n${template}`)(view, null, line.to, line.to)
    }

    view.focus()
}

const stripListMarker = (text) => text
    .replace(LIST_MARKERS.checklist, '$1')
    .replace(LIST_MARKERS.ordered, '$1')
    .replace(LIST_MARKERS.bullet, '$1')

const toggleListMarker = (view, type) => {
    replaceLine(view, (text) => {
        const isChecklist = LIST_MARKERS.checklist.test(text)
        const isOrdered = !isChecklist && LIST_MARKERS.ordered.test(text)
        const isBullet = !isChecklist && !isOrdered && LIST_MARKERS.bullet.test(text)

        const alreadyActive = {
            [LIST_TYPES.CHECKLIST]: isChecklist,
            [LIST_TYPES.ORDERED]: isOrdered,
            [LIST_TYPES.BULLET]: isBullet
        }[type]

        const stripped = stripListMarker(text)
        if (alreadyActive) return stripped

        const indent = stripped.match(LEADING_WHITESPACE_PATTERN)[0]
        const content = stripped.slice(indent.length)

        if (type === LIST_TYPES.CHECKLIST) return `${indent}- [ ] ${content}`
        if (type === LIST_TYPES.ORDERED) return `${indent}1. ${content}`
        return `${indent}- ${content}`
    })
}

const wrap = (chars) => (view) => toggleWrap(view, chars)
const heading = (level) => (view) => toggleHeading(view, level)
const list = (type) => (view) => toggleListMarker(view, type)
const insert = (text) => (view) => insertAtCursor(view, text)
const insertLink = (format) => (view, payload) => insertLineLink(view, payload, format)

const ACTION_HANDLERS = {
    [MARKDOWN_ACTIONS.BOLD]: wrap(WRAP_MARKERS.BOLD),
    [MARKDOWN_ACTIONS.ITALIC]: wrap(WRAP_MARKERS.ITALIC),
    [MARKDOWN_ACTIONS.STRIKE]: wrap(WRAP_MARKERS.STRIKE),
    [MARKDOWN_ACTIONS.CODE]: wrap(WRAP_MARKERS.CODE),
    [MARKDOWN_ACTIONS.H0]: clearHeading,
    ...Object.fromEntries(
        Object.entries(HEADING_ACTION_LEVELS).map(([action, level]) => [action, heading(level)])
    ),
    [MARKDOWN_ACTIONS.QUOTE]: toggleQuote,
    [MARKDOWN_ACTIONS.HR]: insertHorizontalRule,
    [MARKDOWN_ACTIONS.IMAGE]: insertLink((label, url) => `![${label}](${url})`),
    [MARKDOWN_ACTIONS.IMAGE_EMBED]: (view, { embed }) => insertAtCursor(view, `![[${embed}]]`),
    [MARKDOWN_ACTIONS.LINK]: insertLink((label, url) => `[${label}](${url})`),
    [MARKDOWN_ACTIONS.WIKI_LINK]: insertWikiLink,
    [MARKDOWN_ACTIONS.LIST_BULLET]: list(LIST_TYPES.BULLET),
    [MARKDOWN_ACTIONS.LIST_ORDERED]: list(LIST_TYPES.ORDERED),
    [MARKDOWN_ACTIONS.LIST_CHECKLIST]: list(LIST_TYPES.CHECKLIST),
    [MARKDOWN_ACTIONS.INDENT]: indentMore,
    [MARKDOWN_ACTIONS.OUTDENT]: indentLess,
    [MARKDOWN_ACTIONS.FOLD]: toggleFold,
    [MARKDOWN_ACTIONS.INSERT_DATE]: insert('{{date}}'),
    [MARKDOWN_ACTIONS.INSERT_TIME]: insert('{{time}}'),
    [MARKDOWN_ACTIONS.INSERT_TITLE]: insert('{{title}}'),
    [MARKDOWN_ACTIONS.UNDO]: undo,
    [MARKDOWN_ACTIONS.REDO]: redo,
    [MARKDOWN_ACTIONS.SEARCH_NEXT]: findNext,
    [MARKDOWN_ACTIONS.SEARCH_PREVIOUS]: findPrevious,
    [MARKDOWN_ACTIONS.SEARCH_REPLACE]: replaceNext,
    [MARKDOWN_ACTIONS.SEARCH_REPLACE_ALL]: replaceAll,
    [MARKDOWN_ACTIONS.TABLE]: insertTable
}

export const runAction = (view, action, payload) => ACTION_HANDLERS[action]?.(view, payload)
