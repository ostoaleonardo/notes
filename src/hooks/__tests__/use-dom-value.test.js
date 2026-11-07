import { act, renderHook } from '@testing-library/react-native'

import { useDomValue } from '../use-dom-value'

import { DOM_EMITTED_VALUES_LIMIT } from '@/constants/editor-sync'

const setup = async (initial = 'start') => {
    const onChangeText = jest.fn()
    const rendered = await renderHook(
        ({ value }) => useDomValue(value, onChangeText),
        { initialProps: { value: initial } }
    )

    return { onChangeText, ...rendered }
}

describe('dom value', () => {
    test('starts with the note value and no external change', async () => {
        const { result } = await setup()

        expect(result.current.domValue).toBe('start')
        expect(result.current.valueNonce).toBe(0)
    })

    test('does not send back the text the dom just emitted', async () => {
        const { result, rerender } = await setup()

        await act(async () => result.current.onDomChange('start!'))
        await rerender({ value: 'start!' })

        expect(result.current.domValue).toBe('start')
        expect(result.current.valueNonce).toBe(0)
    })

    test('forwards the emitted text to the note change handler', async () => {
        const { result, onChangeText } = await setup()

        await act(async () => result.current.onDomChange('typed'))

        expect(onChangeText).toHaveBeenCalledWith('typed')
    })

    test('sends a change that did not come from the dom', async () => {
        const { result, rerender } = await setup()

        await rerender({ value: 'external' })

        expect(result.current.domValue).toBe('external')
        expect(result.current.valueNonce).toBe(1)
    })

    test('sends an external change equal to the previous external value', async () => {
        const { result, rerender } = await setup()

        await rerender({ value: 'external' })
        await act(async () => result.current.onDomChange('external!'))
        await rerender({ value: 'external!' })
        await rerender({ value: 'external' })

        expect(result.current.domValue).toBe('external')
        expect(result.current.valueNonce).toBe(2)
    })

    test('ignores out of order echoes of recent dom changes', async () => {
        const { result, rerender } = await setup()

        await act(async () => {
            result.current.onDomChange('a')
            result.current.onDomChange('ab')
        })
        await rerender({ value: 'a' })
        await rerender({ value: 'ab' })

        expect(result.current.valueNonce).toBe(0)
    })

    test('does not bump the nonce when the value does not change', async () => {
        const { result, rerender } = await setup()

        await rerender({ value: 'external' })
        await rerender({ value: 'external' })

        expect(result.current.valueNonce).toBe(1)
    })

    test('forgets old emitted values after the limit', async () => {
        const { result, rerender } = await setup()

        await act(async () => {
            for (let index = 0; index <= DOM_EMITTED_VALUES_LIMIT + 1; index++) {
                result.current.onDomChange(`v${index}`)
            }
        })
        await rerender({ value: 'v0' })

        expect(result.current.valueNonce).toBe(1)
    })

    test('keeps the change handler stable', async () => {
        const { result, rerender } = await setup()
        const first = result.current.onDomChange

        await rerender({ value: 'other' })

        expect(result.current.onDomChange).toBe(first)
    })
})
