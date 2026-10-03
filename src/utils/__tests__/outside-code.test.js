import { mapOutsideCode } from '../outside-code'

const upper = (text) => text.toUpperCase()

describe('map outside code', () => {
    test('transforms plain text', () => {
        expect(mapOutsideCode('hello', upper)).toBe('HELLO')
    })

    test('leaves inline code untouched', () => {
        expect(mapOutsideCode('a `b` c', upper)).toBe('A `b` C')
    })

    test('leaves double backtick spans containing a backtick untouched', () => {
        expect(mapOutsideCode('a ``b`c`` d', upper)).toBe('A ``b`c`` D')
    })

    test('leaves fenced blocks untouched', () => {
        const text = 'a\n```js\nb\n```\nc'

        expect(mapOutsideCode(text, upper)).toBe('A\n```js\nb\n```\nC')
    })

    test('leaves tilde fences untouched', () => {
        expect(mapOutsideCode('a\n~~~\nb\n~~~\nc', upper)).toBe('A\n~~~\nb\n~~~\nC')
    })

    test('treats an unclosed fence as code until the end', () => {
        expect(mapOutsideCode('a\n```\nb\nc', upper)).toBe('A\n```\nb\nc')
    })

    test('does not close a fence on a shorter fence line', () => {
        const text = '````\n```\nb\n````\nc'

        expect(mapOutsideCode(text, upper)).toBe('````\n```\nb\n````\nC')
    })

    test('transforms text between several code spans', () => {
        expect(mapOutsideCode('`a` b `c` d', upper)).toBe('`a` B `c` D')
    })
})
