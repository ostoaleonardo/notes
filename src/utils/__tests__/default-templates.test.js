import { getDefaultTemplates } from '../default-templates'
import { getWelcomeNote } from '../welcome-note'
import { DEFAULT_TEMPLATE_FILES } from '@/constants/default-templates'

describe('default templates', () => {
    const templates = getDefaultTemplates()

    test('creates one template per default file', () => {
        expect(templates.map((template) => template.filename).sort())
            .toEqual(Object.values(DEFAULT_TEMPLATE_FILES).sort())
    })

    test('every template has headings and non-empty content', () => {
        templates.forEach((template) => {
            expect(template.content).toContain('## ')
        })
    })

    test('titled templates start with the title and date placeholders', () => {
        const titled = templates.filter(
            (template) => template.filename !== DEFAULT_TEMPLATE_FILES.JOURNAL
        )

        titled.forEach((template) => {
            expect(template.content.startsWith('# {{title}}\n{{date}}\n\n')).toBe(true)
        })
    })

    test('checklist template contains unchecked tasks', () => {
        const checklist = templates.find(
            (template) => template.filename === DEFAULT_TEMPLATE_FILES.CHECKLIST
        )

        expect(checklist.content).toContain('- [ ] ')
    })
})

describe('welcome note', () => {
    const note = getWelcomeNote()

    test('has a title and content', () => {
        expect(note.title.length).toBeGreaterThan(0)
        expect(note.content.length).toBeGreaterThan(0)
    })

    test('contains the style, tools and pro sections separated by rules', () => {
        expect(note.content.match(/^## /gm).length).toBeGreaterThanOrEqual(4)
        expect(note.content).toContain('\n---\n')
    })

    test('contains an example table and task', () => {
        expect(note.content).toContain('| --- | --- |')
        expect(note.content).toContain('- [ ] ')
    })
})
