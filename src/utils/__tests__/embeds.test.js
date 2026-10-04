import { extractEmbedImageNames, resolveEmbeds } from '../embeds'

const notes = [
    { path: 'a', title: 'Alpha', note: 'alpha body' },
    { path: 'b', title: 'Beta', note: 'beta ![[Alpha]]' },
    { path: 'c', title: 'Loop', note: 'again ![[Loop]]' },
    { path: 'd', title: 'Deep', note: '![[Beta]]' }
]

const getImageUrl = (name) => (
    name === 'ghost.png' ? null : `file:///images/${encodeURIComponent(name)}`
)
const resolve = (value, selfPath) => resolveEmbeds(value, { notes, getImageUrl, selfPath })

describe('resolve embeds', () => {
    test('inlines the body of an embedded note under its title', () => {
        const result = resolve('![[Alpha]]')

        expect(result).toContain('<div class="embed-title"><span>Alpha</span></div>')
        expect(result).toContain('alpha body')
    })

    test('adds a link to the original note when requested', () => {
        const result = resolveEmbeds('![[Alpha]]', { notes, getImageUrl, withOpenLink: true })

        expect(result).toContain('<a href="wikilink://a" class="embed-open">')
    })

    test('links the open button to the embedded heading', () => {
        const withHeading = [{ path: 'h', title: 'Doc', note: '# Intro\ntext' }]
        const result = resolveEmbeds('![[Doc#Intro]]', {
            notes: withHeading,
            getImageUrl,
            withOpenLink: true
        })

        expect(result).toContain('href="wikilink://h#Intro"')
    })

    test('omits the open button by default', () => {
        expect(resolve('![[Alpha]]')).not.toContain('embed-open')
    })

    test('turns image embeds into markdown images', () => {
        expect(resolve('![[photo one.png]]')).toBe('![photo one.png](file:///images/photo%20one.png)')
    })

    test('applies a numeric size to image embeds', () => {
        expect(resolve('![[a.png|200]]')).toBe('<img src="file:///images/a.png" alt="a.png" width="200">')
    })

    test('resolves nested embeds up to the depth limit', () => {
        const result = resolve('![[Deep]]')

        expect(result).toContain('<div class="embed-title"><span>Beta</span></div>')
        expect(result).not.toContain('alpha body')
        expect(result).toContain('[[Alpha]]')
    })

    test('leaves embeds inside inline code untouched', () => {
        expect(resolve('use `![[Alpha]]` here')).toBe('use `![[Alpha]]` here')
    })

    test('leaves embeds inside fenced blocks untouched', () => {
        const value = '```\n![[Alpha]]\n```'

        expect(resolve(value)).toBe(value)
    })

    test('does not embed a note into itself', () => {
        const result = resolve('![[Loop]]')

        expect(result).toContain('again [[Loop]]')
    })

    test('does not embed the current note', () => {
        expect(resolve('![[Alpha]]', 'a')).toBe('[[Alpha]]')
    })

    test('turns an image embed without a stored file into a plain wiki link', () => {
        expect(resolve('![[ghost.png]]')).toBe('[[ghost.png]]')
    })

    test('turns an unresolved embed into a plain wiki link', () => {
        expect(resolve('![[Missing]]')).toBe('[[Missing]]')
    })
})

describe('extract embed image names', () => {
    test('lists each embedded image once', () => {
        const value = '![[a.png]] text ![[b one.jpg|200]] ![[a.png]] ![[Alpha]]'

        expect(extractEmbedImageNames(value)).toEqual(['a.png', 'b one.jpg'])
    })

    test('ignores embeds inside code', () => {
        expect(extractEmbedImageNames('`![[a.png]]`')).toEqual([])
    })
})

describe('file embeds', () => {
    test('turns an embed of a non-image file into a plain link', () => {
        const result = resolveEmbeds('![[sample.pdf]] and ![[song.wav]]', { notes, getImageUrl })

        expect(result).toBe('[[sample.pdf]] and [[song.wav]]')
    })
})

describe('block embeds', () => {
    const blockNotes = [
        { path: 'p', title: 'Source', note: 'Intro\n\nKey idea ^idea\n\nOutro' }
    ]
    const resolveBlock = (value) => resolveEmbeds(value, { notes: blockNotes, getImageUrl })

    test('embeds only the referenced block', () => {
        const result = resolveBlock('![[Source#^idea]]')

        expect(result).toContain('Key idea')
        expect(result).not.toContain('Intro')
        expect(result).not.toContain('^idea')
    })

    test('turns an embed of a missing block into a plain wiki link', () => {
        expect(resolveBlock('![[Source#^nope]]')).toBe('[[Source#^nope]]')
    })
})

describe('heading embeds', () => {
    const sectionNotes = [
        {
            path: 'p',
            title: 'Source',
            note: '# One\n\nfirst\n\n## Sub\n\nnested\n\n# Two\n\nsecond'
        }
    ]
    const resolveSection = (value, selfPath) => resolveEmbeds(
        value,
        { notes: sectionNotes, getImageUrl, selfPath }
    )

    test('embeds the section up to the next heading of the same level', () => {
        const result = resolveSection('![[Source#One]]')

        expect(result).toContain('first')
        expect(result).toContain('nested')
        expect(result).not.toContain('second')
    })

    test('stops a subsection at the next heading of a higher level', () => {
        const result = resolveSection('![[Source#Sub]]')

        expect(result).toContain('nested')
        expect(result).not.toContain('first')
        expect(result).not.toContain('second')
    })

    test('matches the heading ignoring case and spacing', () => {
        expect(resolveSection('![[Source#  TWO ]]')).toContain('second')
    })

    test('turns an embed of a missing heading into a plain wiki link', () => {
        expect(resolveSection('![[Source#Nope]]')).toBe('[[Source#Nope]]')
    })

    test('turns an embed of a heading in the same note into a plain wiki link', () => {
        expect(resolveSection('![[#One]]', 'p')).toBe('[[#One]]')
    })
})
