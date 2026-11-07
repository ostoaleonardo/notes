import { rememberEmittedValue } from '../emitted-values'

import { DOM_EMITTED_VALUES_LIMIT } from '@/constants/editor-sync'

describe('remember emitted values', () => {
    test('keeps the most recent values only', () => {
        const emitted = new Set()

        for (let index = 0; index <= DOM_EMITTED_VALUES_LIMIT; index++) {
            rememberEmittedValue(emitted, `v${index}`)
        }

        expect(emitted.size).toBe(DOM_EMITTED_VALUES_LIMIT)
        expect(emitted.has('v0')).toBe(false)
        expect(emitted.has(`v${DOM_EMITTED_VALUES_LIMIT}`)).toBe(true)
    })

    test('moves a repeated value to the most recent position', () => {
        const emitted = new Set(['a', 'b'])

        rememberEmittedValue(emitted, 'a')

        expect([...emitted]).toEqual(['b', 'a'])
    })
})
