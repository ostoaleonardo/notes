import { act, renderHook } from '@testing-library/react-native'

import { useTemplatesList } from '../use-templates-list'
import { notifyTemplatesChanged } from '@/utils/templates-events'

const mockListTemplates = jest.fn()
const mockListTemplateFolders = jest.fn()

jest.mock('../use-templates', () => ({
    useTemplates: () => ({
        listTemplates: mockListTemplates,
        listTemplateFolders: mockListTemplateFolders
    })
}))

describe('templates list', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockListTemplates.mockResolvedValue([{ filename: 'a.md' }])
        mockListTemplateFolders.mockResolvedValue(['folder'])
    })

    test('loads templates and folders on mount', async () => {
        const { result } = await renderHook(() => useTemplatesList())

        expect(result.current.templates).toEqual([{ filename: 'a.md' }])
        expect(result.current.folders).toEqual(['folder'])
    })

    test('waits for a manual refresh when it is not immediate', async () => {
        const { result } = await renderHook(() => (
            useTemplatesList([], { immediate: false })
        ))

        expect(result.current.templates).toEqual([])

        await act(async () => result.current.refresh())

        expect(result.current.templates).toEqual([{ filename: 'a.md' }])
    })

    test('reloads when templates change elsewhere', async () => {
        await renderHook(() => useTemplatesList())
        mockListTemplates.mockClear()

        await act(async () => notifyTemplatesChanged())

        expect(mockListTemplates).toHaveBeenCalledTimes(1)
    })

    test('reloads when its dependencies change', async () => {
        const { rerender } = await renderHook(
            ({ deps }) => useTemplatesList(deps),
            { initialProps: { deps: ['a'] } }
        )
        mockListTemplates.mockClear()

        await rerender({ deps: ['b'] })

        expect(mockListTemplates).toHaveBeenCalledTimes(1)
    })
})
