import { renderHook } from '@testing-library/react-native'

import { useBacklinksHtml } from '../use-backlinks-html'

const mockNotes = [
    { path: 'r::Target.md', title: 'Target', note: '' },
    { path: 'r::Source.md', title: 'Source', note: 'see [[Target]]' }
]

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('../use-notes', () => ({
    useNotes: () => ({
        notes: mockNotes,
        notePaths: new Map(mockNotes.map((note) => [note.path, '']))
    })
}))

describe('backlinks html', () => {
    test('is empty when backlinks are disabled', async () => {
        const { result } = await renderHook(() => useBacklinksHtml('r::Target.md', false))

        expect(result.current).toBe('')
    })

    test('lists the notes linking to the target when enabled', async () => {
        const { result } = await renderHook(() => useBacklinksHtml('r::Target.md', true))

        expect(result.current).toContain('Source')
        expect(result.current).toContain('title.backlinks')
    })

    test('is empty when nothing links to the note', async () => {
        const { result } = await renderHook(() => useBacklinksHtml('r::Source.md', true))

        expect(result.current).toBe('')
    })
})
