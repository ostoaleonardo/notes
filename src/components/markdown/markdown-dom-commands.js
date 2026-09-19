import { EditorSelection } from '@codemirror/state'
import { redo, undo } from '@codemirror/commands'
import { findNext, findPrevious, replaceAll, replaceNext } from '@codemirror/search'
import { toggleFold } from '@codemirror/language'
import { snippet } from '@codemirror/autocomplete'

const insertWikiLinkSnippet = snippet('[[${}]]')

const buildTableTemplate = (cols, rows) => {
    const header = Array.from({ length: cols }, (_, c) => `\${Column ${c + 1}}`).join(' | ')
    const separator = Array(cols).fill('---').join(' | ')
    const bodyLines = Array.from({ length: rows }, (_, r) => (
        Array.from({ length: cols }, (_, c) => `\${Cell ${r * cols + c + 1}}`).join(' | ')
    ))

    return [`| ${header} |`, `| ${separator} |`, ...bodyLines.map((line) => `| ${line} |`)].join('\n')
}

const LIST_MARKERS = {
    checklist: /^(\s*)-\s+\[[ xX]\]\s+/,
    ordered: /^(\s*)\d+\.\s+/,
    bullet: /^(\s*)[-*+]\s+/
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

        const alreadyActive = (type === 'checklist' && isChecklist)
            || (type === 'ordered' && isOrdered)
            || (type === 'bullet' && isBullet)

        const stripped = stripListMarker(text)
        if (alreadyActive) return stripped

        const indent = stripped.match(/^\s*/)[0]
        const content = stripped.slice(indent.length)

        if (type === 'checklist') return `${indent}- [ ] ${content}`
        if (type === 'ordered') return `${indent}1. ${content}`
        return `${indent}- ${content}`
    })
}

export const runAction = (view, action, payload) => {
    switch (action) {
        case 'bold': return toggleWrap(view, '*')
        case 'italic': return toggleWrap(view, '_')
        case 'strike': return toggleWrap(view, '~~')
        case 'code': return toggleWrap(view, '`')
        case 'h1': return toggleHeading(view, 1)
        case 'h2': return toggleHeading(view, 2)
        case 'h3': return toggleHeading(view, 3)
        case 'h4': return toggleHeading(view, 4)
        case 'h5': return toggleHeading(view, 5)
        case 'h6': return toggleHeading(view, 6)
        case 'quote': return toggleQuote(view)
        case 'hr': return insertHorizontalRule(view)
        case 'image': return insertLineLink(view, payload, (label, url) => `![${label}](${url})`)
        case 'link': return insertLineLink(view, payload, (label, url) => `[${label}](${url})`)
        case 'wiki-link': return insertWikiLink(view)
        case 'list-bullet': return toggleListMarker(view, 'bullet')
        case 'list-ordered': return toggleListMarker(view, 'ordered')
        case 'list-checklist': return toggleListMarker(view, 'checklist')
        case 'fold': return toggleFold(view)
        case 'insert-date': return insertAtCursor(view, '{{date}}')
        case 'insert-time': return insertAtCursor(view, '{{time}}')
        case 'insert-title': return insertAtCursor(view, '{{title}}')
        case 'undo': return undo(view)
        case 'redo': return redo(view)
        case 'search-next': return findNext(view)
        case 'search-previous': return findPrevious(view)
        case 'search-replace': return replaceNext(view)
        case 'search-replace-all': return replaceAll(view)
        case 'table': return insertTable(view, payload)
        default: return
    }
}
