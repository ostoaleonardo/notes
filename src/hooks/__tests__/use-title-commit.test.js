import { act, renderHook } from '@testing-library/react-native'

import { useTitleCommit } from '../use-title-commit'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { DUPLICATE_TITLE_ERROR } from '@/constants/note-errors'

const mockWarnTitleLinks = jest.fn()

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))

jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))

jest.mock('../use-title-link-warning', () => ({
    useTitleLinkWarning: () => mockWarnTitleLinks
}))

const buildOptions = (overrides = {}) => ({
    title: ' New ',
    note: 'body',
    titleRef: { current: 'Old' },
    setTitle: jest.fn(),
    setNote: jest.fn(),
    buildPayload: jest.fn((title, note = 'body') => ({ title, note })),
    runExclusive: jest.fn((task) => task()),
    saveWithLinkCheck: jest.fn(async (payload) => ({ savedNote: payload, path: 'p' })),
    applySaved: jest.fn(),
    ...overrides
})

const renderCommitHook = async (options) => {
    let rendered

    await act(async () => {
        rendered = renderHook(() => useTitleCommit(options))
    })

    return rendered
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('title blur', () => {
    test('warns about the trimmed title and saves it', async () => {
        const options = buildOptions()
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(mockWarnTitleLinks).toHaveBeenCalledWith('New')
        expect(options.saveWithLinkCheck).toHaveBeenCalledWith({ title: 'New', note: 'body' }, 'Old')
        expect(options.titleRef.current).toBe('New')
    })

    test('does nothing when the title did not change', async () => {
        const options = buildOptions({ titleRef: { current: 'New' } })
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(options.runExclusive).not.toHaveBeenCalled()
    })

    test('does nothing while commits are disabled', async () => {
        const options = buildOptions({ canCommit: () => false })
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(options.runExclusive).not.toHaveBeenCalled()
    })
})

describe('commit result', () => {
    test('reports the rewritten note body and updates the editor', async () => {
        const onSaved = jest.fn()
        const options = buildOptions({
            onSaved,
            saveWithLinkCheck: jest.fn(async () => ({ savedNote: { note: 'rewritten' }, path: 'p' }))
        })
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(options.applySaved).toHaveBeenCalledWith({ path: 'p' })
        expect(onSaved).toHaveBeenCalledWith('rewritten')
        expect(options.setNote).toHaveBeenCalledWith('rewritten')
    })

    test('reverts the title and warns when it is a duplicate', async () => {
        const error = Object.assign(new Error('duplicate'), { code: DUPLICATE_TITLE_ERROR })
        const options = buildOptions({ saveWithLinkCheck: jest.fn(async () => { throw error }) })
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(options.setTitle).toHaveBeenCalledWith('Old')
        expect(options.titleRef.current).toBe('Old')
        expect(showSnackbar).toHaveBeenCalledWith('notes.title_duplicated')
    })

    test('flags the busy ref only while saving', async () => {
        const busyRef = { current: false }
        let seenDuringSave
        const options = buildOptions({
            busyRef,
            saveWithLinkCheck: jest.fn(async (payload) => {
                seenDuringSave = busyRef.current
                return { savedNote: payload }
            })
        })
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onTitleBlur())

        expect(seenDuringSave).toBe(true)
        expect(busyRef.current).toBe(false)
    })
})

describe('restore version', () => {
    test('puts the version into the editor and commits its title', async () => {
        const options = buildOptions()
        const { result } = await renderCommitHook(options)

        await act(async () => result.current.onRestoreVersion({ title: ' Restored ', content: 'old body' }))

        expect(options.setTitle).toHaveBeenCalledWith(' Restored ')
        expect(options.setNote).toHaveBeenCalledWith('old body')
        expect(options.buildPayload).toHaveBeenCalledWith('Restored', 'old body')
    })
})
