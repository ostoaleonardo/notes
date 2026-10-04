import { shouldApplyExternalValue } from '../markdown-dom-external-value'

const build = (overrides) => ({
    value: 'external',
    docValue: 'typed',
    lastEmitted: 'typed',
    pendingEmitted: new Set(),
    ...overrides
})

describe('apply external editor value', () => {
    test('applies a value that differs from everything the editor emitted', () => {
        expect(shouldApplyExternalValue(build())).toBe(true)
    })

    test('ignores the echo of the latest emitted value', () => {
        expect(shouldApplyExternalValue(build({ value: 'typed' }))).toBe(false)
    })

    test('ignores a stale echo of a value emitted while typing', () => {
        const pendingEmitted = new Set(['typ', 'type', 'typed'])

        expect(shouldApplyExternalValue(build({ value: 'typ', pendingEmitted }))).toBe(false)
    })

    test('ignores a value the document already holds', () => {
        expect(shouldApplyExternalValue(build({ value: 'typed', lastEmitted: 'other' }))).toBe(false)
    })
})
