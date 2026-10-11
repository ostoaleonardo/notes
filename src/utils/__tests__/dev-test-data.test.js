import { buildDevTestPlan, listDevFolders } from '../dev-test-data'
import { buildLinkGraph, findOrphanNotes, listUnresolvedLinks } from '../link-graph'
import { NOTES_PER_FOLDER, TREE_BRANCHING } from '@/constants/dev-menu'

const toNotes = (plan) => plan.notes.map((entry) => {
    const folder = entry.folder.join('/')

    return { path: `${folder}::${entry.title}`, title: entry.title, note: entry.body, folder }
})

const toNotePaths = (notes) => new Map(notes.map((note) => [note.path, note.folder]))

describe('list dev folders', () => {
    test('creates every folder with its subfolders', () => {
        const folders = listDevFolders()

        expect(folders).toHaveLength(TREE_BRANCHING + TREE_BRANCHING * TREE_BRANCHING)
        expect(folders[0]).toEqual(['Folder 1'])
        expect(folders[1]).toEqual(['Folder 1', 'Subfolder 1.1'])
    })
})

describe('dev test plan', () => {
    const plan = buildDevTestPlan()

    test('never repeats a title inside the same folder', () => {
        const keys = plan.notes.map((entry) => `${entry.folder.join('/')}::${entry.title}`)

        expect(new Set(keys).size).toBe(keys.length)
    })

    test('writes only into folders that exist in the plan', () => {
        const known = new Set(['', ...plan.folders.map((folder) => folder.join('/'))])

        plan.notes.forEach((entry) => expect(known.has(entry.folder.join('/'))).toBe(true))
    })

    test('seeds generic notes in the root and in every folder', () => {
        const generic = plan.notes.filter((entry) => / note \d+$/.test(entry.title))

        expect(generic).toHaveLength((plan.folders.length + 1) * NOTES_PER_FOLDER)
    })

    test('provides every attachment that the notes embed', () => {
        const filenames = plan.files.map((file) => file.filename)

        ;['dev-image.png', 'dev-image-2.png', 'sample.pdf', 'sample.txt', 'sample.mp3', 'sample.mp4', 'syntax-sample.png']
            .forEach((name) => expect(filenames).toContain(name))
    })

    test('includes a nested template folder and a root template', () => {
        expect(plan.templates.some((template) => template.folder.length === 0)).toBe(true)
        expect(plan.templates.some((template) => template.folder.length > 0)).toBe(true)
    })

    describe('link features', () => {
        const notes = toNotes(plan)
        const graph = buildLinkGraph(notes, toNotePaths(notes))

        test('has orphan notes and keeps linked notes out of that list', () => {
            const titles = findOrphanNotes(notes, graph).map((note) => note.title)

            expect(titles).toEqual(expect.arrayContaining(['Orphan A', 'Orphan B', 'Orphan deep']))
            expect(titles).not.toContain('Linked A')
            expect(titles).not.toContain('Linked B')
            expect(titles).not.toContain('Test index')
        })

        test('has unresolved links, one of them referenced by two notes', () => {
            const unresolved = listUnresolvedLinks(graph)

            expect(unresolved).toEqual(expect.arrayContaining([
                { id: 'missing:ghost note', title: 'Ghost note', count: 2 },
                expect.objectContaining({ title: 'Missing idea' })
            ]))
        })
    })
})
