import { fillTemplate } from '../fill-template'

describe('fill template', () => {
    test('replaces each placeholder with its value', () => {
        expect(fillTemplate('<a href="{href}">{label}</a>', { href: '/x', label: 'X' })).toBe('<a href="/x">X</a>')
    })

    test('replaces every occurrence of a repeated placeholder', () => {
        expect(fillTemplate('{size}x{size}', { size: 4 })).toBe('4x4')
    })

    test('leaves unknown placeholders untouched', () => {
        expect(fillTemplate('{known} {unknown}', { known: 'a' })).toBe('a {unknown}')
    })

    test('does not interpret replacement patterns inside values', () => {
        expect(fillTemplate('<p>{body}</p>', { body: "$& $1 $'" })).toBe("<p>$& $1 $'</p>")
    })

    test('does not substitute placeholders that appear inside inserted values', () => {
        expect(fillTemplate('{a}{b}', { a: '{b}', b: 'B' })).toBe('{b}B')
    })

    test('ignores css-like braces', () => {
        expect(fillTemplate('a { color: {color}; }', { color: 'red' })).toBe('a { color: red; }')
    })

    test('renders zero and empty values', () => {
        expect(fillTemplate('{a}|{b}', { a: 0, b: '' })).toBe('0|')
    })
})
