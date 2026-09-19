/**
 * @jest-environment jsdom
 */
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history, redoDepth, undoDepth } from '@codemirror/commands'
import { search, searchKeymap, setSearchQuery, SearchQuery } from '@codemirror/search'
import { codeFolding } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { runAction } from '../markdown-dom-commands'
import { listKeymap } from '../markdown-dom-list-keymap'
import { headingFoldService } from '../markdown-dom-fold'

const createView = (doc, cursor = doc.length) => {
    const state = EditorState.create({
        doc,
        selection: { anchor: cursor },
        extensions: [history(), search(), keymap.of([
            ...defaultKeymap, ...historyKeymap, ...searchKeymap
        ])]
    })

    return new EditorView({ state })
}

const createMarkdownView = (doc, cursor = doc.length) => {
    const state = EditorState.create({
        doc,
        selection: { anchor: cursor },
        extensions: [
            markdown({ extensions: GFM }),
            codeFolding(),
            headingFoldService,
            keymap.of([...listKeymap, ...defaultKeymap, ...historyKeymap, ...searchKeymap])
        ]
    })

    return new EditorView({ state })
}

describe('formatting commands', () => {
    test('bold wraps the selected text', () => {
        const view = createView('hello world')
        view.dispatch({ selection: { anchor: 0, head: 5 } })

        runAction(view, 'bold')

        expect(view.state.doc.toString()).toBe('*hello* world')
    })

    test('bold unwraps text already wrapped', () => {
        const view = createView('*hello* world')
        view.dispatch({ selection: { anchor: 1, head: 6 } })

        runAction(view, 'bold')

        expect(view.state.doc.toString()).toBe('hello world')
    })

    test('italic inserts markers at the cursor with no selection', () => {
        const view = createView('')

        runAction(view, 'italic')

        expect(view.state.doc.toString()).toBe('__')
    })

    test('h2 prefixes the current line', () => {
        const view = createView('Title')

        runAction(view, 'h2')

        expect(view.state.doc.toString()).toBe('## Title')
    })

    test('h2 toggles off when the same heading level is applied again', () => {
        const view = createView('## Title')

        runAction(view, 'h2')

        expect(view.state.doc.toString()).toBe('Title')
    })

    test('quote prefixes the current line', () => {
        const view = createView('Some text')

        runAction(view, 'quote')

        expect(view.state.doc.toString()).toBe('> Some text')
    })

    test('link inserts a markdown link using the payload', () => {
        const view = createView('')

        runAction(view, 'link', { title: 'Docs', url: 'https://example.com' })

        expect(view.state.doc.toString()).toBe('[Docs](https://example.com)')
    })

    test('insert-title inserts the title placeholder at the cursor', () => {
        const view = createView('')

        runAction(view, 'insert-title')

        expect(view.state.doc.toString()).toBe('{{title}}')
    })

    test('unknown actions leave the document untouched', () => {
        const view = createView('unchanged')

        runAction(view, 'not-a-real-action')

        expect(view.state.doc.toString()).toBe('unchanged')
    })

    test('table inserts a 2x1 skeleton when no payload is given', () => {
        const view = createView('')

        runAction(view, 'table')

        expect(view.state.doc.toString()).toBe(
            '| Column 1 | Column 2 |\n| --- | --- |\n| Cell 1 | Cell 2 |'
        )
    })

    test('table honors the requested column and row count', () => {
        const view = createView('')

        runAction(view, 'table', { cols: 3, rows: 2 })

        expect(view.state.doc.toString()).toBe(
            '| Column 1 | Column 2 | Column 3 |\n'
            + '| --- | --- | --- |\n'
            + '| Cell 1 | Cell 2 | Cell 3 |\n'
            + '| Cell 4 | Cell 5 | Cell 6 |'
        )
    })
})

describe('list commands', () => {
    test('list-bullet prefixes the current line', () => {
        const view = createView('Milk')

        runAction(view, 'list-bullet')

        expect(view.state.doc.toString()).toBe('- Milk')
    })

    test('list-bullet toggles off an existing bullet', () => {
        const view = createView('- Milk')

        runAction(view, 'list-bullet')

        expect(view.state.doc.toString()).toBe('Milk')
    })

    test('list-ordered replaces an existing bullet marker', () => {
        const view = createView('- Milk')

        runAction(view, 'list-ordered')

        expect(view.state.doc.toString()).toBe('1. Milk')
    })

    test('list-checklist replaces an existing ordered marker', () => {
        const view = createView('1. Milk')

        runAction(view, 'list-checklist')

        expect(view.state.doc.toString()).toBe('- [ ] Milk')
    })

    test('list-checklist toggles off an existing checklist item', () => {
        const view = createView('- [x] Milk')

        runAction(view, 'list-checklist')

        expect(view.state.doc.toString()).toBe('Milk')
    })
})

describe('list continuation on enter', () => {
    const pressEnter = (view) => {
        const binding = listKeymap.find((entry) => entry.key === 'Enter')
        return binding.run(view)
    }

    test('continues a bullet list with the same marker', () => {
        const view = createMarkdownView('- Milk')

        const handled = pressEnter(view)

        expect(handled).toBe(true)
        expect(view.state.doc.toString()).toBe('- Milk\n- ')
    })

    test('increments the marker for an ordered list', () => {
        const view = createMarkdownView('1. Milk')

        pressEnter(view)

        expect(view.state.doc.toString()).toBe('1. Milk\n2. ')
    })

    test('continues a checklist item as unchecked', () => {
        const view = createMarkdownView('- [x] Milk')

        pressEnter(view)

        expect(view.state.doc.toString()).toBe('- [x] Milk\n- [ ] ')
    })

    test('exits the list when the current item is empty', () => {
        const view = createMarkdownView('- Milk\n- ')

        pressEnter(view)

        expect(view.state.doc.toString()).toBe('- Milk\n')
    })

    test('does not intercept enter outside a list', () => {
        const view = createMarkdownView('Plain text')

        const handled = pressEnter(view)

        expect(handled).toBe(false)
        expect(view.state.doc.toString()).toBe('Plain text')
    })
})

describe('fold', () => {
    test('folds the section under a heading', () => {
        const doc = '# Title\nbody line\n# Next'
        const view = createMarkdownView(doc, 3)

        const handled = runAction(view, 'fold')

        expect(handled).toBe(true)
    })
})

describe('search', () => {
    const setQuery = (view, search, replace = '') => {
        view.dispatch({ effects: setSearchQuery.of(new SearchQuery({ search, replace })) })
    }

    test('search-next selects the next match', () => {
        const view = createView('foo bar foo', 0)
        setQuery(view, 'foo')

        runAction(view, 'search-next')

        expect(view.state.selection.main.from).toBe(0)
        expect(view.state.selection.main.to).toBe(3)
    })

    test('search-previous selects the previous match', () => {
        const view = createView('foo bar foo')
        setQuery(view, 'foo')

        runAction(view, 'search-previous')

        expect(view.state.doc.sliceString(view.state.selection.main.from, view.state.selection.main.to)).toBe('foo')
    })

    test('search-replace replaces only the next match', () => {
        const view = createView('foo bar foo', 0)
        setQuery(view, 'foo', 'baz')

        runAction(view, 'search-next')
        runAction(view, 'search-replace')

        expect(view.state.doc.toString()).toBe('baz bar foo')
    })

    test('search-replace-all replaces every match', () => {
        const view = createView('foo bar foo', 0)
        setQuery(view, 'foo', 'baz')

        runAction(view, 'search-replace-all')

        expect(view.state.doc.toString()).toBe('baz bar baz')
    })
})

describe('undo and redo', () => {
    test('undo reverts the last change and enables redo', () => {
        const view = createView('hello')
        view.dispatch({ selection: { anchor: 5 } })
        runAction(view, 'bold')
        expect(view.state.doc.toString()).toBe('hello**')

        runAction(view, 'undo')

        expect(view.state.doc.toString()).toBe('hello')
        expect(redoDepth(view.state)).toBeGreaterThan(0)
    })

    test('redo re-applies the undone change', () => {
        const view = createView('hello')
        view.dispatch({ selection: { anchor: 5 } })
        runAction(view, 'bold')
        runAction(view, 'undo')

        runAction(view, 'redo')

        expect(view.state.doc.toString()).toBe('hello**')
    })

    test('undoDepth is zero for a document with no edits', () => {
        const view = createView('hello')

        expect(undoDepth(view.state)).toBe(0)
    })

    test('undoDepth becomes positive after an edit', () => {
        const view = createView('hello')
        view.dispatch({ selection: { anchor: 5 } })

        runAction(view, 'italic')

        expect(undoDepth(view.state)).toBeGreaterThan(0)
    })

    test('a new edit after undo clears the redo stack', () => {
        const view = createView('hello')
        view.dispatch({ selection: { anchor: 5 } })
        runAction(view, 'bold')
        runAction(view, 'undo')
        expect(redoDepth(view.state)).toBeGreaterThan(0)

        view.dispatch({ changes: { from: 5, insert: '!' } })

        expect(redoDepth(view.state)).toBe(0)
    })
})
