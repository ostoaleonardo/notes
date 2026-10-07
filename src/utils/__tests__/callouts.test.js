import { getCalloutTitle, getCalloutType } from '../callouts'

describe('callout type', () => {
    test('keeps a known type', () => {
        expect(getCalloutType('warning')).toBe('warning')
    })

    test('is case insensitive', () => {
        expect(getCalloutType('TIP')).toBe('tip')
    })

    test('resolves an alias', () => {
        expect(getCalloutType('tldr')).toBe('abstract')
    })

    test('falls back to the default type', () => {
        expect(getCalloutType('unknown')).toBe('note')
    })
})

describe('callout title', () => {
    test('uses the custom title when present', () => {
        expect(getCalloutTitle('tip', '  Custom  ')).toBe('Custom')
    })

    test('capitalizes the raw type when the title is blank', () => {
        expect(getCalloutTitle('WARNING', '   ')).toBe('Warning')
    })
})
