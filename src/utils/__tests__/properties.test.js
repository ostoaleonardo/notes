import {
    applyPropertyChange,
    buildPropertyRows,
    buildPropertySuggestions,
    formatPropertyValue,
    getDefaultPropertyValue,
    inferPropertyType,
    isValidPropertyName,
    parsePropertyValue
} from '../properties'

import { KNOWN_PROPERTIES, PROPERTY_CHANGES, PROPERTY_TYPES } from '@/constants/properties'

describe('property type inference', () => {
    test('maps scalar values to their editable type', () => {
        expect(inferPropertyType('hello')).toBe(PROPERTY_TYPES.TEXT)
        expect(inferPropertyType(null)).toBe(PROPERTY_TYPES.TEXT)
        expect(inferPropertyType(3)).toBe(PROPERTY_TYPES.NUMBER)
        expect(inferPropertyType(true)).toBe(PROPERTY_TYPES.CHECKBOX)
    })

    test('detects date and datetime strings', () => {
        expect(inferPropertyType('2026-10-04')).toBe(PROPERTY_TYPES.DATE)
        expect(inferPropertyType('2026-10-04T09:30')).toBe(PROPERTY_TYPES.DATETIME)
        expect(inferPropertyType('2026-10-04T09:30:15')).toBe(PROPERTY_TYPES.DATETIME)
        expect(inferPropertyType('2026-10-04 09:30')).toBe(PROPERTY_TYPES.TEXT)
        expect(inferPropertyType('2026-10')).toBe(PROPERTY_TYPES.TEXT)
    })

    test('builds today as the default value of date types', () => {
        const now = new Date(2026, 9, 4, 9, 5)

        expect(getDefaultPropertyValue(PROPERTY_TYPES.DATE, now)).toBe('2026-10-04')
        expect(getDefaultPropertyValue(PROPERTY_TYPES.DATETIME, now)).toBe('2026-10-04T09:05')
        expect(getDefaultPropertyValue(PROPERTY_TYPES.CHECKBOX, now)).toBe(false)
    })

    test('maps arrays of scalars to a list', () => {
        expect(inferPropertyType(['a', 1, false])).toBe(PROPERTY_TYPES.LIST)
    })

    test('marks nested structures as unsupported', () => {
        expect(inferPropertyType({ a: 1 })).toBe(PROPERTY_TYPES.UNSUPPORTED)
        expect(inferPropertyType([{ a: 1 }])).toBe(PROPERTY_TYPES.UNSUPPORTED)
    })
})

describe('property rows', () => {
    test('keeps the key order and the inferred types', () => {
        const rows = buildPropertyRows({ author: 'Ana', version: 2 })

        expect(rows).toEqual([
            { key: 'author', type: PROPERTY_TYPES.TEXT, value: 'Ana' },
            { key: 'version', type: PROPERTY_TYPES.NUMBER, value: 2 }
        ])
    })

    test('shows unsupported values as readable text', () => {
        const rows = buildPropertyRows({
            nested: { a: 1 }
        })

        expect(rows[0].value).toBe('{"a":1}')
    })

    test('returns no rows without properties', () => {
        expect(buildPropertyRows(undefined)).toEqual([])
    })
})

describe('property name validation', () => {
    test('accepts a new trimmed name', () => {
        expect(isValidPropertyName(['author'], ' version ')).toBe(true)
    })

    test('rejects empty, duplicated and reserved names', () => {
        expect(isValidPropertyName([], '   ')).toBe(false)
        expect(isValidPropertyName(['author'], 'author')).toBe(false)
        expect(isValidPropertyName([], 'Tags')).toBe(false)
    })
})

describe('property changes', () => {
    test('sets a new property after the existing ones', () => {
        const next = applyPropertyChange(
            { author: 'Ana' },
            { action: PROPERTY_CHANGES.SET, key: 'version', value: 1 }
        )

        expect(Object.entries(next)).toEqual([['author', 'Ana'], ['version', 1]])
    })

    test('updates the value of an existing property', () => {
        const next = applyPropertyChange(
            { author: 'Ana' },
            { action: PROPERTY_CHANGES.SET, key: 'author', value: 'Luis' }
        )

        expect(next).toEqual({ author: 'Luis' })
    })

    test('ignores a new property with a reserved or empty name', () => {
        const properties = { author: 'Ana' }

        expect(
            applyPropertyChange(
                properties,
                { action: PROPERTY_CHANGES.SET, key: 'tags', value: [] }
            )
        ).toBe(properties)
        expect(
            applyPropertyChange(properties, { action: PROPERTY_CHANGES.SET, key: ' ', value: '' })
        ).toBe(properties)
    })

    test('removes a property', () => {
        const next = applyPropertyChange(
            { author: 'Ana', version: 1 },
            { action: PROPERTY_CHANGES.REMOVE, key: 'author' }
        )

        expect(next).toEqual({ version: 1 })
    })

    test('renames a property keeping its position and value', () => {
        const next = applyPropertyChange(
            { author: 'Ana', version: 1, status: 'draft' },
            { action: PROPERTY_CHANGES.RENAME, key: 'version', nextKey: 'revision' }
        )

        expect(Object.entries(next)).toEqual([
            ['author', 'Ana'],
            ['revision', 1],
            ['status', 'draft']
        ])
    })

    test('ignores a rename to a name already in use', () => {
        const properties = { author: 'Ana', version: 1 }
        const next = applyPropertyChange(
            properties,
            { action: PROPERTY_CHANGES.RENAME, key: 'version', nextKey: 'author' }
        )

        expect(next).toBe(properties)
    })

    test('keeps values that are not editable untouched', () => {
        const date = new Date('2024-01-02T00:00:00.000Z')
        const next = applyPropertyChange(
            { created: date },
            { action: PROPERTY_CHANGES.SET, key: 'author', value: 'Ana' }
        )

        expect(next.created).toBe(date)
    })
})

describe('property values', () => {
    test('parses numbers and falls back to null when invalid', () => {
        expect(parsePropertyValue(PROPERTY_TYPES.NUMBER, '12.5')).toBe(12.5)
        expect(parsePropertyValue(PROPERTY_TYPES.NUMBER, '-')).toBeNull()
        expect(parsePropertyValue(PROPERTY_TYPES.NUMBER, '')).toBeNull()
    })

    test('parses a comma separated list ignoring blanks', () => {
        expect(parsePropertyValue(PROPERTY_TYPES.LIST, 'a, b,, c ')).toEqual(['a', 'b', 'c'])
    })

    test('keeps text as typed', () => {
        expect(parsePropertyValue(PROPERTY_TYPES.TEXT, ' hi ')).toBe(' hi ')
    })

    test('formats lists, numbers and empty values for inputs', () => {
        expect(formatPropertyValue(PROPERTY_TYPES.LIST, ['a', 'b'])).toBe('a, b')
        expect(formatPropertyValue(PROPERTY_TYPES.NUMBER, 3)).toBe('3')
        expect(formatPropertyValue(PROPERTY_TYPES.NUMBER, null)).toBe('')
    })
})

describe('property suggestions', () => {
    test('offers the known properties', () => {
        const suggestions = buildPropertySuggestions({ properties: {}, tags: [] })

        expect(suggestions).toEqual(KNOWN_PROPERTIES)
    })

    test('hides tags once the note has them and properties already present', () => {
        const suggestions = buildPropertySuggestions({
            properties: { author: 'Ana' },
            tags: ['work']
        })

        expect(suggestions).toEqual(
            KNOWN_PROPERTIES.filter(
                ({ key, type }) => key !== 'author' && type !== PROPERTY_TYPES.TAGS
            )
        )
    })
})
