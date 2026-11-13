import fs from 'fs'
import path from 'path'

import { getDefaultTemplates } from '../default-templates'
import { getWelcomeNote } from '../welcome-note'
import { setBundledContent } from '../bundled-content'
import { DEFAULT_TEMPLATE_FILES } from '@/constants/default-templates'

const CONTENT_DIR = path.join(process.cwd(), 'src', 'content')

const readContent = (...parts) => fs.readFileSync(path.join(CONTENT_DIR, ...parts), 'utf8')

const readLanguage = (language) => ({
    welcome: readContent('welcome', `${language}.md`),
    templates: Object.fromEntries(
        Object.keys(DEFAULT_TEMPLATE_FILES).map((key) => [
            key.toLowerCase(),
            readContent('templates', language, `${key.toLowerCase()}.md`)
        ])
    )
})

beforeAll(() => {
    const en = readLanguage('en')
    const es = readLanguage('es')

    setBundledContent({
        welcome: { en: en.welcome, es: es.welcome },
        templates: { en: en.templates, es: es.templates }
    })
})

describe('default templates', () => {
    test('creates one template per default file', () => {
        expect(getDefaultTemplates().map((template) => template.filename).sort())
            .toEqual(Object.values(DEFAULT_TEMPLATE_FILES).sort())
    })

    test('every template has headings and non-empty content', () => {
        getDefaultTemplates().forEach((template) => {
            expect(template.content).toContain('## ')
        })
    })

    test('titled templates start with the title and date placeholders', () => {
        const titled = getDefaultTemplates().filter(
            (template) => template.filename !== DEFAULT_TEMPLATE_FILES.JOURNAL
        )

        titled.forEach((template) => {
            expect(template.content.startsWith('# {{title}}\n{{date}}\n\n')).toBe(true)
        })
    })

    test('checklist template contains unchecked tasks', () => {
        const checklist = getDefaultTemplates().find(
            (template) => template.filename === DEFAULT_TEMPLATE_FILES.CHECKLIST
        )

        expect(checklist.content).toContain('- [ ] ')
    })
})

describe('welcome note', () => {
    test('splits the title line from the content', () => {
        const note = getWelcomeNote()

        expect(note.title).toBe('Welcome')
        expect(note.content.startsWith('# ')).toBe(false)
        expect(note.content.length).toBeGreaterThan(0)
    })

    test('contains the style, tools and pro sections separated by rules', () => {
        const { content } = getWelcomeNote()

        expect(content.match(/^## /gm).length).toBeGreaterThanOrEqual(4)
        expect(content).toContain('\n---\n')
    })

    test('contains an example table and task', () => {
        const { content } = getWelcomeNote()

        expect(content).toContain('| --- | --- |')
        expect(content).toContain('- [ ] ')
    })
})
