import { EditorState } from '@codemirror/state'
import { EditorView } from '@codemirror/view'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { extensions } from '@/features/syntax/note-parser'

import { linksReset } from '../link-resolution'
import { mediaResolution, mediaResolverFacet, resolvedMediaField } from '../media-resolution'
import { LINK_RESOLUTION_DEBOUNCE_MS } from '../constants/link-resolution'

const DOC = 'a ![[photo.png]] b ![[clip.mp4|200]] c ![[Note]] d [[photo.png]]'

const flush = async () => {
    await jest.advanceTimersByTimeAsync(LINK_RESOLUTION_DEBOUNCE_MS + 1)
}

const mount = (resolve, doc = DOC) => {
    const parent = document.createElement('div')
    document.body.appendChild(parent)

    const view = new EditorView({
        parent,
        state: EditorState.create({
            doc,
            extensions: [
                markdown({ extensions: [GFM, ...extensions] }),
                mediaResolverFacet.of({ current: resolve }),
                mediaResolution
            ]
        })
    })

    return view
}

const resolved = (view) => Object.fromEntries(view.state.field(resolvedMediaField))

beforeEach(() => jest.useFakeTimers())
afterEach(() => jest.useRealTimers())

describe('media resolution in the editor', () => {
    test('asks once for the embedded media names of the document', async () => {
        const resolve = jest.fn(async (names) => Object.fromEntries(names.map((name) => [name, `url:${name}`])))
        const view = mount(resolve)

        await flush()

        expect(resolve).toHaveBeenCalledTimes(1)
        expect(resolve).toHaveBeenCalledWith(['photo.png', 'clip.mp4'])
        expect(resolved(view)).toEqual({ 'photo.png': 'url:photo.png', 'clip.mp4': 'url:clip.mp4' })
    })

    test('does not ask again for names that are already known', async () => {
        const resolve = jest.fn(async (names) => Object.fromEntries(names.map((name) => [name, 'u'])))
        const view = mount(resolve)

        await flush()
        view.dispatch({ changes: { from: 0, insert: 'x ' } })
        await flush()

        expect(resolve).toHaveBeenCalledTimes(1)
    })

    test('asks only for the names that appear after an edit', async () => {
        const resolve = jest.fn(async (names) => Object.fromEntries(names.map((name) => [name, 'u'])))
        const view = mount(resolve)

        await flush()
        view.dispatch({ changes: { from: view.state.doc.length, insert: ' ![[new.jpg]]' } })
        await flush()

        expect(resolve).toHaveBeenLastCalledWith(['new.jpg'])
    })

    test('keeps names that could not be resolved as known', async () => {
        const resolve = jest.fn(async (names) => Object.fromEntries(names.map((name) => [name, null])))
        const view = mount(resolve, '![[missing.png]]')

        await flush()

        expect(resolved(view)).toEqual({ 'missing.png': null })
    })

    test('asks again after the resolution is reset', async () => {
        const resolve = jest.fn(async (names) => Object.fromEntries(names.map((name) => [name, 'u'])))
        const view = mount(resolve, '![[photo.png]]')

        await flush()
        view.dispatch({ effects: linksReset.of(null) })
        await flush()

        expect(resolve).toHaveBeenCalledTimes(2)
    })

    test('ignores documents without embedded media', async () => {
        const resolve = jest.fn(async () => ({}))

        mount(resolve, 'plain [[Note]] text')
        await flush()

        expect(resolve).not.toHaveBeenCalled()
    })
})
