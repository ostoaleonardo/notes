import { toggleTask } from '../tasks'

describe('toggle task', () => {
    test('checks an unchecked task', () => {
        expect(toggleTask('- [ ] one\n- [ ] two', 1)).toBe('- [ ] one\n- [x] two')
    })

    test('unchecks a checked task', () => {
        expect(toggleTask('- [x] one\n- [X] two', 1)).toBe('- [x] one\n- [ ] two')
    })

    test('counts nested and quoted tasks in document order', () => {
        const source = '- [ ] a\n    - [ ] b\n\n> - [ ] c'

        expect(toggleTask(source, 1)).toBe('- [ ] a\n    - [x] b\n\n> - [ ] c')
        expect(toggleTask(source, 2)).toBe('- [ ] a\n    - [ ] b\n\n> - [x] c')
    })

    test('works on ordered lists', () => {
        expect(toggleTask('1. [ ] first', 0)).toBe('1. [x] first')
    })

    test('ignores tasks inside code blocks and comments', () => {
        const source = [
            '```',
            '- [ ] code',
            '```',
            '',
            '%%',
            '- [ ] hidden',
            '%%',
            '',
            '- [ ] real'
        ].join('\n')

        expect(toggleTask(source, 0)).toBe(source.replace('- [ ] real', '- [x] real'))
    })

    test('ignores list items that are not tasks', () => {
        expect(toggleTask('- item\n- [ ] task', 0)).toBe('- item\n- [x] task')
    })

    test('keeps the source when the index does not exist', () => {
        expect(toggleTask('- [ ] only', 3)).toBe('- [ ] only')
    })
})
