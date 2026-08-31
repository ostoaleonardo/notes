/**
 * @jest-environment jsdom
 */
import { EditorState } from '@codemirror/state'
import { EditorView, keymap } from '@codemirror/view'
import { defaultKeymap, historyKeymap, history, redoDepth, undoDepth } from '@codemirror/commands'
import { runAction } from '../markdown-dom-commands'

const createView = (doc, cursor = doc.length) => {
    const state = EditorState.create({
        doc,
        selection: { anchor: cursor },
        extensions: [history(), keymap.of([
            ...defaultKeymap, ...historyKeymap
        ])]
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
