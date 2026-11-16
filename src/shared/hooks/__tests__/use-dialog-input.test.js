import { act, renderHook } from '@testing-library/react-native'

import { useCreateDialogInput, useEditDialogInput } from '../use-dialog-input'

describe('create dialog input', () => {
    test('is disabled while the value is blank', async () => {
        const { result } = await renderHook(() => useCreateDialogInput(true))

        expect(result.current[2]).toBe(true)

        await act(async () => result.current[1]('   '))

        expect(result.current[2]).toBe(true)
    })

    test('is enabled once there is text', async () => {
        const { result } = await renderHook(() => useCreateDialogInput(true))

        await act(async () => result.current[1]('Notes'))

        expect(result.current[2]).toBe(false)
    })

    test('clears the value when the dialog opens again', async () => {
        const { result, rerender } = await renderHook(
            ({ visible }) => useCreateDialogInput(visible),
            { initialProps: { visible: true } }
        )

        await act(async () => result.current[1]('Notes'))
        await rerender({ visible: false })
        await rerender({ visible: true })

        expect(result.current[0]).toBe('')
    })
})

describe('edit dialog input', () => {
    const initialFor = (key) => ({ a: 'Alpha', b: 'Beta' })[key]

    test('starts with the initial value and stays disabled', async () => {
        const { result } = await renderHook(() => useEditDialogInput('a', initialFor))

        expect(result.current[0]).toBe('Alpha')
        expect(result.current[2]).toBe('Alpha')
        expect(result.current[3]).toBe(true)
    })

    test('enables once the value differs from the initial one', async () => {
        const { result } = await renderHook(() => useEditDialogInput('a', initialFor))

        await act(async () => result.current[1]('Alpha 2'))

        expect(result.current[3]).toBe(false)
    })

    test('stays disabled when the change is only surrounding whitespace', async () => {
        const { result } = await renderHook(() => useEditDialogInput('a', initialFor))

        await act(async () => result.current[1]('  Alpha  '))

        expect(result.current[3]).toBe(true)
    })

    test('reloads the initial value when the key changes', async () => {
        const { result, rerender } = await renderHook(
            ({ key }) => useEditDialogInput(key, initialFor),
            { initialProps: { key: 'a' } }
        )

        await rerender({ key: 'b' })

        expect(result.current[0]).toBe('Beta')
        expect(result.current[2]).toBe('Beta')
    })

    test('falls back to an empty value when the key is unknown', async () => {
        const { result } = await renderHook(() => useEditDialogInput('zzz', initialFor))

        expect(result.current[0]).toBe('')
        expect(result.current[3]).toBe(true)
    })
})
