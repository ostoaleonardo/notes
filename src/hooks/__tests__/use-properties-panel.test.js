import { act, renderHook } from '@testing-library/react-native'

import { usePropertiesPanel } from '../use-properties-panel'

const mockT = (key) => key
const mockTranslation = { t: mockT }

jest.mock('react-i18next', () => ({
    useTranslation: () => mockTranslation
}))

const mockAllTags = ['all-one', 'all-two']

jest.mock('../use-tags', () => ({
    useTags: () => ({ tags: mockAllTags })
}))

const mockToggle = jest.fn()

jest.mock('../use-show-properties', () => ({
    useShowProperties: () => ({ propertiesVisible: true, onToggleProperties: mockToggle })
}))

const setup = async (overrides = {}) => {
    const props = {
        tags: ['a'],
        properties: { status: 'open' },
        setTags: jest.fn(),
        setProperties: jest.fn(),
        invalid: false,
        ...overrides
    }

    const rendered = await renderHook(() => usePropertiesPanel(props))

    return { props, ...rendered }
}

const applyUpdate = (setter) => setter.mock.calls[0][0]

describe('properties panel model', () => {
    test('exposes the tags, the global tags and the visibility', async () => {
        const { result } = await setup()

        expect(result.current.propertiesPanel.tags).toEqual(['a'])
        expect(result.current.propertiesPanel.allTags).toEqual(['all-one', 'all-two'])
        expect(result.current.propertiesPanel.visible).toBe(true)
    })

    test('flags the panel as invalid', async () => {
        const { result } = await setup({ invalid: true })

        expect(result.current.propertiesPanel.invalid).toBe(true)
    })

    test('keeps the same model while its inputs do not change', async () => {
        const { result, rerender } = await setup()
        const first = result.current.propertiesPanel

        await rerender()

        expect(result.current.propertiesPanel).toBe(first)
    })
})

describe('tag handlers', () => {
    test('adds a sanitized tag', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onAddTag(' New Tag '))

        expect(applyUpdate(props.setTags)(['a'])).toEqual(['a', 'New-Tag'])
    })

    test('ignores a tag that is already present', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onAddTag('a'))

        const previous = ['a']

        expect(applyUpdate(props.setTags)(previous)).toBe(previous)
    })

    test('ignores an invalid tag name', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onAddTag('   '))

        expect(props.setTags).not.toHaveBeenCalled()
    })

    test('removes a tag', async () => {
        const { result, props } = await setup()

        await act(async () => result.current.onRemoveTag('a'))

        expect(applyUpdate(props.setTags)(['a', 'b'])).toEqual(['b'])
    })
})
