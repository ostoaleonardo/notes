import { noteParser } from '../note-parser'

const listNodes = (text, names) => {
    const found = []

    noteParser.parse(text).iterate({
        enter: (node) => {
            if (names.includes(node.name)) found.push([node.name, text.slice(node.from, node.to)])
        }
    })

    return found
}

describe('wiki links', () => {
    test('parses target and alias', () => {
        expect(listNodes('a [[T|alias]] b', ['WikiLink', 'WikiLinkTarget', 'WikiLinkAlias'])).toEqual([
            ['WikiLink', '[[T|alias]]'],
            ['WikiLinkTarget', 'T'],
            ['WikiLinkAlias', 'alias']
        ])
    })

    test('parses embeds as their own node', () => {
        expect(listNodes('![[pic.png|200]]', ['WikiEmbed', 'WikiLink'])).toEqual([
            ['WikiEmbed', '![[pic.png|200]]']
        ])
    })

    test('ignores links inside code', () => {
        const text = '`[[a]]`\n\n```\n[[b]]\n```\n\n    [[c]]\n'

        expect(listNodes(text, ['WikiLink'])).toEqual([])
    })

    test('honors escapes and rejects malformed links', () => {
        const text = '\\[[a]] [[]] [[x\ny]] [[|z]] [[ok]]'

        expect(listNodes(text, ['WikiLink'])).toEqual([['WikiLink', '[[ok]]']])
    })

    test('keeps single brackets inside targets out of the match', () => {
        expect(listNodes('[[Name [with] brackets]] [[Name ]]', ['WikiLinkTarget'])).toEqual([
            ['WikiLinkTarget', 'Name ']
        ])
    })
})

describe('inline tags', () => {
    test('parses tags at word starts only', () => {
        expect(listNodes('#one a#b #two/ x #nested/tag', ['Tag'])).toEqual([
            ['Tag', '#one'],
            ['Tag', '#two'],
            ['Tag', '#nested/tag']
        ])
    })

    test('skips numeric tags, headings and code', () => {
        expect(listNodes('# Heading\n\n#123 `#code` #ok', ['Tag'])).toEqual([['Tag', '#ok']])
    })
})

describe('block ids', () => {
    test('parses ids at line end', () => {
        expect(listNodes('text ^abc-1\n\n^lone', ['BlockId'])).toEqual([
            ['BlockId', '^abc-1'],
            ['BlockId', '^lone']
        ])
    })

    test('rejects ids followed by text', () => {
        expect(listNodes('a ^id more', ['BlockId'])).toEqual([])
    })
})

describe('highlight and comment marks', () => {
    test('parses highlights and rejects padded marks', () => {
        expect(listNodes('==yes== == no==', ['Highlight'])).toEqual([['Highlight', '==yes==']])
    })

    test('keeps links inside highlights', () => {
        expect(listNodes('==see [[Note]]==', ['Highlight', 'WikiLink'])).toEqual([
            ['Highlight', '==see [[Note]]=='],
            ['WikiLink', '[[Note]]']
        ])
    })

    test('parses comments across lines', () => {
        expect(listNodes('a %% x\ny %% b', ['Comment'])).toEqual([['Comment', '%% x\ny %%']])
    })
})

describe('custom tasks', () => {
    test('parses custom statuses inside list items', () => {
        expect(listNodes('- [-] a\n- [/] b\n- [ ] c\n- [x] d', ['CustomTaskMarker', 'TaskMarker'])).toEqual([
            ['CustomTaskMarker', '[-]'],
            ['CustomTaskMarker', '[/]'],
            ['TaskMarker', '[ ]'],
            ['TaskMarker', '[x]']
        ])
    })

    test('ignores markers outside list items and inside code', () => {
        expect(listNodes('[-] a\n\n```\n- [-] b\n```', ['CustomTaskMarker'])).toEqual([])
    })
})

describe('math', () => {
    test('parses inline and display math as opaque nodes', () => {
        expect(listNodes('a $x[[y]]$ b $$\n[[z]]\n$$ c', ['InlineMath', 'BlockMath', 'WikiLink'])).toEqual([
            ['InlineMath', '$x[[y]]$'],
            ['BlockMath', '$$\n[[z]]\n$$']
        ])
    })

    test('leaves currency amounts as text', () => {
        expect(listNodes('costs $5 and $10 [[Link]]', ['InlineMath', 'WikiLink'])).toEqual([
            ['WikiLink', '[[Link]]']
        ])
    })
})

describe('callouts', () => {
    test('parses the callout marker inside a blockquote', () => {
        const text = '> [!warning]- Folded title\n> body [[Link]]\n\n> plain quote'

        expect(listNodes(text, ['CalloutMarker', 'WikiLink'])).toEqual([
            ['CalloutMarker', '[!warning]-'],
            ['WikiLink', '[[Link]]']
        ])
    })

    test('ignores markers outside blockquotes', () => {
        expect(listNodes('[!note] text', ['CalloutMarker'])).toEqual([])
    })
})

describe('frontmatter', () => {
    test('parses the leading block and keeps links inside it', () => {
        const text = '---\nrelated: "[[Link]]"\n---\n\nBody [[Other]]'

        expect(listNodes(text, ['Frontmatter', 'WikiLink'])).toEqual([
            ['Frontmatter', '---\nrelated: "[[Link]]"\n---'],
            ['WikiLink', '[[Link]]'],
            ['WikiLink', '[[Other]]']
        ])
    })

    test('treats an unclosed fence as a normal rule', () => {
        expect(listNodes('---\nno end\n', ['Frontmatter', 'HorizontalRule'])).toEqual([
            ['HorizontalRule', '---']
        ])
    })

    test('only applies at the start of the document', () => {
        expect(listNodes('text\n\n---\na: 1\n---\n', ['Frontmatter'])).toEqual([])
    })
})
