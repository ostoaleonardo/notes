import { Text } from '@codemirror/state'

import { isBlankDoc } from '../markdown-dom-placeholder'

describe('blank document detection', () => {
    test('treats an empty document as blank', () => {
        expect(isBlankDoc(Text.of(['']))).toBe(true)
    })

    test('treats a document with only line breaks and spaces as blank', () => {
        expect(isBlankDoc(Text.of(['', '  ', '', ''.padEnd(3, '\t')]))).toBe(true)
    })

    test('treats a document with any visible character as not blank', () => {
        expect(isBlankDoc(Text.of(['', '', 'a']))).toBe(false)
    })
})
