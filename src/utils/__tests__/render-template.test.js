import { renderTemplate } from '../render-template'

describe('render template', () => {
    test('replaces the title placeholder', () => {
        expect(renderTemplate('# {{title}}', { title: 'Weekly review' })).toBe('# Weekly review')
    })

    test('falls back to an empty string when no title is given', () => {
        expect(renderTemplate('# {{title}}')).toBe('# ')
    })

    test('replaces date and time placeholders with non-empty values', () => {
        const result = renderTemplate('{{date}} - {{time}}')
        const [date, time] = result.split(' - ')
        expect(date.length).toBeGreaterThan(0)
        expect(time.length).toBeGreaterThan(0)
    })

    test('leaves unknown placeholders untouched', () => {
        expect(renderTemplate('{{unknown}}')).toBe('{{unknown}}')
    })

    test('replaces every occurrence of the same placeholder', () => {
        expect(renderTemplate('{{title}} / {{title}}', { title: 'Note' })).toBe('Note / Note')
    })
})
