import { shell } from '@codemirror/legacy-modes/mode/shell'

import { findCodeLanguage, legacySupport } from '../code-languages'

describe('code languages', () => {
    test('resolves names and aliases case-insensitively', () => {
        expect(findCodeLanguage('js').name).toBe('JavaScript')
        expect(findCodeLanguage('TS').name).toBe('TypeScript')
        expect(findCodeLanguage('bash').name).toBe('Shell')
    })

    test('returns null for unknown or empty info', () => {
        expect(findCodeLanguage('nope')).toBeNull()
        expect(findCodeLanguage('')).toBeNull()
    })
})

describe('legacy language support', () => {
    test('exposes a language with a parser so markdown can nest it', () => {
        expect(legacySupport(shell).language.parser).toBeDefined()
    })
})
