import { findCustomTaskRanges, toggleTask } from '../tasks'

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

    test('unchecks a custom status because it renders as checked', () => {
        expect(toggleTask('- [/] doing', 0)).toBe('- [ ] doing')
        expect(toggleTask('- [-] dropped\n- [>] later', 1)).toBe('- [-] dropped\n- [ ] later')
    })

    test('counts custom statuses together with regular tasks', () => {
        expect(toggleTask('- [ ] a\n- [/] b\n- [ ] c', 2)).toBe('- [ ] a\n- [/] b\n- [x] c')
    })

    test('keeps the source when the index does not exist', () => {
        expect(toggleTask('- [ ] only', 3)).toBe('- [ ] only')
    })
})

describe('find custom task ranges', () => {
    test('returns the marker range and status of each custom task', () => {
        expect(findCustomTaskRanges('- [/] a\n- [-] b')).toEqual([
            { from: 2, to: 5, status: '/' },
            { from: 10, to: 13, status: '-' }
        ])
    })

    test('ignores regular tasks and plain brackets', () => {
        expect(findCustomTaskRanges('- [ ] a\n- [x] b\n[/] c\n- [/]d')).toEqual([])
    })

    test('supports nested, quoted and numbered tasks', () => {
        const ranges = findCustomTaskRanges('  - [>] a\n> - [/] b\n1. [-] c')

        expect(ranges.map((range) => range.status)).toEqual(['>', '/', '-'])
    })
})
