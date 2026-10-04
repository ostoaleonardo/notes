import { findOutgoingLinks } from '../outgoing-links'

const notes = [
    { path: 'self', title: 'Self' },
    { path: 'a', title: 'Alpha' },
    { path: 'b', title: 'Beta' }
]

describe('find outgoing links', () => {
    test('lists linked notes once, in order of appearance', () => {
        const content = '[[Beta]] then [[Alpha]] and [[Beta#Part|again]] plus ![[Alpha]]'

        expect(findOutgoingLinks(content, 'self', notes)).toEqual([
            { key: 'b', path: 'b', title: 'Beta' },
            { key: 'a', path: 'a', title: 'Alpha' }
        ])
    })

    test('lists links to missing notes without a path', () => {
        expect(findOutgoingLinks('[[Ghost]] [[ghost]]', 'self', notes)).toEqual([
            { key: 'missing:ghost', path: undefined, title: 'Ghost' }
        ])
    })

    test('skips links to the same note, attachments and code', () => {
        const content = '[[#Heading]] [[Self]] [[manual.pdf]] `[[Alpha]]`'

        expect(findOutgoingLinks(content, 'self', notes)).toEqual([])
    })

    test('returns nothing for empty content', () => {
        expect(findOutgoingLinks('', 'self', notes)).toEqual([])
        expect(findOutgoingLinks(undefined, 'self', notes)).toEqual([])
    })
})
