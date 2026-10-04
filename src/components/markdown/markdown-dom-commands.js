import { EditorSelection } from '@codemirror/state'
import { indentLess, indentMore, redo, undo } from '@codemirror/commands'
import { findNext, findPrevious, replaceAll, replaceNext } from '@codemirror/search'
import { toggleFold } from '@codemirror/language'
import { snippet } from '@codemirror/autocomplete'

import { LIST_MARKERS, LIST_TYPES, WRAP_MARKERS } from '@/constants/markdown-patterns'

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
        const match = text.match(/^(#{1,6})\s+(.*)$/)
        const marker = '#'.repeat(level)

        if (match && match[1] === marker) return match[2]

        const content = match ? match[2] : text
        return `${marker} ${content}`
    })
}

const toggleQuote = (view) => {
    replaceLine(view, (text) => {
        if (text.startsWith('> ')) return text.slice(2)
        if (text.startsWith('>')) return text.slice(1)
        return `> ${text}`
    })
}

const insertHorizontalRule = (view) => {
    const line = currentLine(view)

    if (line.text.trim() === '') {
        view.dispatch({
            changes: { from: line.from, to: line.to, insert: '___' },
            selection: EditorSelection.cursor(line.from + 3)
        })
    } else {
        view.dispatch({
            changes: { from: line.to, insert: '\n___' },
            selection: EditorSelection.cursor(line.to + 4)
        })
    }

    view.focus()
}

const insertLineLink = (view, payload, format) => {
    const line = currentLine(view)
    const { title, url } = payload || {}
    const label = title && title.trim() !== '' ? title : line.text
    const newText = format(label, url || 'url')

    view.dispatch({
        changes: { from: line.from, to: line.to, insert: newText },
        selection: EditorSelection.cursor(line.from + newText.length)
    })

    view.focus()
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
    const { cols = 2, rows = 1 } = payload || {}
    const { from, to } = view.state.selection.main

    snippet(buildTableTemplate(cols, rows))(view, null, from, to)
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

        const indent = stripped.match(/^\s*/)[0]
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
    bold: wrap(WRAP_MARKERS.BOLD),
    italic: wrap(WRAP_MARKERS.ITALIC),
    strike: wrap(WRAP_MARKERS.STRIKE),
    code: wrap(WRAP_MARKERS.CODE),
    h1: heading(1),
    h2: heading(2),
    h3: heading(3),
    h4: heading(4),
    h5: heading(5),
    h6: heading(6),
    quote: toggleQuote,
    hr: insertHorizontalRule,
    image: insertLink((label, url) => `![${label}](${url})`),
    'image-embed': (view, { embed }) => insertAtCursor(view, `![[${embed}]]`),
    link: insertLink((label, url) => `[${label}](${url})`),
    'wiki-link': insertWikiLink,
    'list-bullet': list(LIST_TYPES.BULLET),
    'list-ordered': list(LIST_TYPES.ORDERED),
    'list-checklist': list(LIST_TYPES.CHECKLIST),
    indent: indentMore,
    outdent: indentLess,
    fold: toggleFold,
    'insert-date': insert('{{date}}'),
    'insert-time': insert('{{time}}'),
    'insert-title': insert('{{title}}'),
    undo,
    redo,
    'search-next': findNext,
    'search-previous': findPrevious,
    'search-replace': replaceNext,
    'search-replace-all': replaceAll,
    table: insertTable
}

export const runAction = (view, action, payload) => ACTION_HANDLERS[action]?.(view, payload)
