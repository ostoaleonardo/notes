import { act, renderHook } from '@testing-library/react-native'

import { useNoteTemplates } from '../use-note-templates'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { TEMPLATE_INSERT_SEPARATOR } from '@/constants/template-placeholders'

const mockAddTemplate = jest.fn()
const mockRefresh = jest.fn()

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))
jest.mock('../use-templates', () => ({
    useTemplates: () => ({ addTemplate: mockAddTemplate })
}))
jest.mock('../use-templates-list', () => ({
    useTemplatesList: () => ({ templates: [{ name: 'Daily' }], refresh: mockRefresh })
}))

const setup = async (content = { noteId: 'a.md', title: 'My note', content: 'body' }) => {
    const latestContent = { current: content }
    const setNote = jest.fn()
    const rendered = await renderHook(() => useNoteTemplates({ latestContent, setNote }))

    return { setNote, ...rendered }
}

beforeEach(() => {
    jest.clearAllMocks()
    mockAddTemplate.mockResolvedValue(undefined)
})

describe('select template', () => {
    test('appends the template to a non-empty note', async () => {
        const { result, setNote } = await setup()

        await act(async () => result.current.onSelect('template'))

        const update = setNote.mock.calls[0][0]

        expect(update('body')).toBe(`body${TEMPLATE_INSERT_SEPARATOR}template`)
    })

    test('replaces an empty note with the template', async () => {
        const { result, setNote } = await setup()

        await act(async () => result.current.onSelect('template'))

        const update = setNote.mock.calls[0][0]

        expect(update('')).toBe('template')
    })
})

describe('save note as template', () => {
    test('saves the latest title and content and confirms', async () => {
        const { result } = await setup({ noteId: 'a.md', title: '  My note ', content: 'latest' })

        await act(async () => result.current.onSaveAsTemplate())

        expect(mockAddTemplate).toHaveBeenCalledWith('My note', 'latest')
        expect(showSnackbar).toHaveBeenCalledWith('templates.saved')
    })

    test('falls back to the placeholder title when the title is blank', async () => {
        const { result } = await setup({ noteId: 'a.md', title: '   ', content: 'latest' })

        await act(async () => result.current.onSaveAsTemplate())

        expect(mockAddTemplate).toHaveBeenCalledWith('placeholder.title', 'latest')
    })

    test('warns when saving fails', async () => {
        mockAddTemplate.mockRejectedValue(new Error('boom'))
        const { result } = await setup()

        await act(async () => result.current.onSaveAsTemplate())

        expect(showSnackbar).toHaveBeenCalledWith('templates.save_failed')
    })
})

describe('open template picker', () => {
    test('refreshes the template list', async () => {
        const { result } = await setup()

        await act(async () => result.current.onOpen())

        expect(mockRefresh).toHaveBeenCalledTimes(1)
    })
})
