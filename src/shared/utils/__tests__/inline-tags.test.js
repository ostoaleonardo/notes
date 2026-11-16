import { extractInlineTags, findInlineTags } from '../inline-tags'

describe('inline tags', () => {
    test('finds tags at the start of the body and after whitespace', () => {
        expect(extractInlineTags('#one text #two\n#three')).toEqual(['one', 'two', 'three'])
    })

    test('keeps nested tags whole', () => {
        expect(extractInlineTags('see #work/projects/a')).toEqual(['work/projects/a'])
    })

    test('allows letters, digits, underscores and hyphens', () => {
        expect(extractInlineTags('#a_b-c1 #ñandú')).toEqual(['a_b-c1', 'ñandú'])
    })

    test('stops at punctuation', () => {
        expect(extractInlineTags('done #work, then #home.')).toEqual(['work', 'home'])
    })

    test('ignores tags made only of digits', () => {
        expect(extractInlineTags('issue #1984 and #2024a')).toEqual(['2024a'])
    })

    test('ignores headings and hashes inside words or links', () => {
        const body = '# Title\n## Sub\nfoo#bar [link](#anchor) http://x.com/#frag'

        expect(extractInlineTags(body)).toEqual([])
    })

    test('ignores tags inside inline and fenced code', () => {
        const body = 'use `#nope` here\n```\n#also-no\n```\n~~~\n#nor-this\n~~~\n#yes'

        expect(extractInlineTags(body)).toEqual(['yes'])
    })

    test('drops trailing slashes and repeated tags ignoring case', () => {
        expect(extractInlineTags('#a/ #A #b')).toEqual(['a', 'b'])
    })

    test('returns nothing for an empty body', () => {
        expect(extractInlineTags('')).toEqual([])
        expect(extractInlineTags(undefined)).toEqual([])
    })
})

describe('inline tag ranges', () => {
    test('reports the range of each tag including the hash', () => {
        expect(findInlineTags('a #one b #two/x')).toEqual([
            { name: 'one', from: 2, to: 6 },
            { name: 'two/x', from: 9, to: 15 }
        ])
    })

    test('keeps repeated occurrences so every one can be highlighted', () => {
        expect(findInlineTags('#a #a').map(({ from }) => from)).toEqual([0, 3])
    })

    test('ignores hashes inside the frontmatter block', () => {
        const text = '---\ncolor: "#fff"\n---\n#real'

        expect(findInlineTags(text).map(({ name }) => name)).toEqual(['real'])
    })
})
