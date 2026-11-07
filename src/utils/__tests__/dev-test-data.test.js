import fs from 'fs'
import path from 'path'

import { buildDevTestPlan, groupDevData, listDevFolders, parseDevDataKey } from '../dev-test-data'
import { buildConnectionModel, summarizeConnections } from '../connection-model'
import { parseFrontmatter } from '../frontmatter'
import { NOTES_PER_FOLDER, TREE_BRANCHING } from '@/constants/dev-menu'

const DEV_DATA_DIR = path.join(process.cwd(), 'dev-data')

const readDevData = () => (
    fs.readdirSync(DEV_DATA_DIR, { recursive: true })
        .filter((relative) => fs.statSync(path.join(DEV_DATA_DIR, relative)).isFile())
        .map((relative) => {
            const entry = parseDevDataKey(`./${relative.split(path.sep).join('/')}`)
            const content = fs.readFileSync(path.join(DEV_DATA_DIR, relative), 'utf8')

            return { ...entry, content }
        })
)

const getTitle = (filename) => filename.replace(/\.md$/, '')

const toNotes = (plan) => plan.notes.map(({ folder, filename, content }) => {
    const folderPath = folder.join('/')

    return {
        path: `${folderPath}::${filename}`,
        title: getTitle(filename),
        note: parseFrontmatter(content).body,
        properties: parseFrontmatter(content).frontmatter,
        folder: folderPath
    }
})

const toNotePaths = (notes) => new Map(notes.map((note) => [note.path, note.folder]))

describe('parse dev data key', () => {
    test('splits the kind, the folder and the filename', () => {
        expect(parseDevDataKey('./notes/Folder 1/Subfolder 1.1/Orphan deep.md')).toEqual({
            kind: 'notes',
            folder: ['Folder 1', 'Subfolder 1.1'],
            filename: 'Orphan deep.md'
        })
    })

    test('keeps root files without a folder', () => {
        expect(parseDevDataKey('./attachments/sample.pdf')).toEqual({
            kind: 'attachments',
            folder: [],
            filename: 'sample.pdf'
        })
    })
})

describe('list dev folders', () => {
    test('creates every folder with its subfolders', () => {
        const folders = listDevFolders()

        expect(folders).toHaveLength(TREE_BRANCHING + TREE_BRANCHING * TREE_BRANCHING)
        expect(folders[0]).toEqual(['Folder 1'])
        expect(folders[1]).toEqual(['Folder 1', 'Subfolder 1.1'])
    })
})

describe('dev test plan', () => {
    const plan = buildDevTestPlan(groupDevData(readDevData()))

    test('never repeats a filename inside the same folder', () => {
        const keys = plan.notes.map(({ folder, filename }) => `${folder.join('/')}::${filename}`)

        expect(new Set(keys).size).toBe(keys.length)
    })

    test('creates every folder before the notes written into it', () => {
        const known = new Set(['', ...plan.folders.map((folder) => folder.join('/'))])

        plan.notes.forEach(({ folder }) => expect(known.has(folder.join('/'))).toBe(true))
    })

    test('lists parent folders before their children', () => {
        const order = plan.folders.map((folder) => folder.join('/'))

        plan.folders.forEach((folder, index) => {
            if (folder.length > 1) expect(order.indexOf(folder.slice(0, -1).join('/'))).toBeLessThan(index)
        })
    })

    test('seeds generic notes in the root and in every generated folder', () => {
        const generic = plan.notes.filter(({ filename }) => / note \d+\.md$/.test(filename))

        expect(generic).toHaveLength((listDevFolders().length + 1) * NOTES_PER_FOLDER)
    })

    test('provides every attachment that the notes embed', () => {
        const filenames = new Set(plan.files.map(({ filename }) => filename))
        const embedded = plan.notes
            .flatMap(({ content }) => [...content.matchAll(/!?\[\[([^\]|#]+\.(?:png|pdf|txt|wav|mp4))/g)])
            .map((match) => match[1])
            .filter((filename) => filename !== 'missing-file.pdf')

        expect(embedded.length).toBeGreaterThan(0)
        embedded.forEach((filename) => expect(filenames).toContain(filename))
    })

    test('includes a nested template folder and a root template', () => {
        expect(plan.templates.some(({ folder }) => folder.length === 0)).toBe(true)
        expect(plan.templates.some(({ folder }) => folder.length > 0)).toBe(true)
    })

    describe('link features', () => {
        const notes = toNotes(plan)
        const summary = summarizeConnections(
            buildConnectionModel({ notes, notePaths: toNotePaths(notes), files: [] })
        )

        test('has orphan notes and keeps linked notes out of that list', () => {
            const titles = summary.orphans.map((note) => note.title)

            expect(titles).toEqual(expect.arrayContaining(['Orphan A', 'Orphan B', 'Orphan deep']))
            expect(titles).not.toContain('Linked A')
            expect(titles).not.toContain('Linked B')
            expect(titles).not.toContain('Test index')
        })

        test('has unresolved links, one of them referenced by two notes', () => {
            const ghost = summary.unresolved.find((link) => link.title === 'Ghost note')

            expect(ghost.sources).toHaveLength(2)
            expect(summary.unresolved.map((link) => link.title)).toContain('Missing idea')
        })
    })
})
