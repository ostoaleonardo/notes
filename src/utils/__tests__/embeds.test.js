import { resolveEmbeds } from '../embeds'

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

        expect(result).toContain('<div class="embed-title">Alpha</div>')
        expect(result).toContain('alpha body')
    })

    test('turns image embeds into markdown images', () => {
        expect(resolve('![[photo one.png]]')).toBe('![photo one.png](file:///images/photo%20one.png)')
    })

    test('applies a numeric size to image embeds', () => {
        expect(resolve('![[a.png|200]]')).toBe('<img src="file:///images/a.png" alt="a.png" width="200">')
    })

    test('resolves nested embeds up to the depth limit', () => {
        const result = resolve('![[Deep]]')

        expect(result).toContain('<div class="embed-title">Beta</div>')
        expect(result).not.toContain('alpha body')
        expect(result).toContain('[[Alpha]]')
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
