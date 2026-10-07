import {
    createNote,
    getRepositoryUri,
    persistNoteUpdate,
    planNoteUpdate,
    planWikiLinkRename,
    withOptimisticUpdate,
    writeChangedNotes
} from '../note-operations'
import { parseFrontmatter } from '../frontmatter'

const REPO_URI = 'file:///repo'
const REPOSITORIES = [{ id: 'repo-1', uri: REPO_URI }]

const HANDLE = { name: 'Groceries.md', uri: 'file:///repo/Groceries.md' }

const createFakeStorage = (initialFiles = {}) => {
    const files = new Map(Object.entries(initialFiles))
    const calls = { versions: [] }

    return {
        files,
        calls,
        listMarkdownFiles: jest.fn(() => [...files.keys()].map((name) => ({
            name,
            delete: () => files.delete(name)
        }))),
        getExistingFile: jest.fn(
            (fileUri) => (fileUri === 'file:///repo/Groceries.md' ? HANDLE : undefined)
        ),
        writeNoteFile: (_uri, filename, content) => {
            files.set(filename, content)
            return { creationTime: 10, lastModified: 20 }
        },
        renameVersions: async (_root, from, to) => {
            calls.versions.push([from, to])
        }
    }
}

const createNoteDraft = (overrides = {}) => ({
    title: 'Groceries',
    note: 'milk',
    tags: [],
    repositoryId: 'repo-1',
    ...overrides
})

describe('get repository uri', () => {
    test('returns the uri of the matching repository', () => {
        expect(getRepositoryUri(REPOSITORIES, 'repo-1')).toBe(REPO_URI)
    })

    test('returns undefined when the repository is unknown', () => {
        expect(getRepositoryUri(REPOSITORIES, 'missing')).toBeUndefined()
    })
})

describe('create note', () => {
    test('writes the file and returns the record with its location and times', () => {
        const storage = createFakeStorage()

        const { record, result } = createNote(
            { note: createNoteDraft(), repositoryId: 'repo-1', uri: REPO_URI },
            storage
        )

        expect(result).toEqual({
            path: 'repo-1::Groceries.md',
            filename: 'Groceries.md',
            createdAt: 10,
            updatedAt: 20
        })
        expect(record.path).toBe('repo-1::Groceries.md')
        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe('milk')
    })

    test('keeps the record in memory only when there is no repository uri', () => {
        const storage = createFakeStorage()

        const { record, result } = createNote(
            { note: createNoteDraft(), repositoryId: 'repo-1', uri: undefined },
            storage
        )

        expect(result).toEqual({ path: '', filename: '' })
        expect(record.filename).toBe('')
        expect(storage.files.size).toBe(0)
    })
})

describe('plan note update', () => {
    const previous = {
        ...createNoteDraft(),
        path: 'repo-1::Groceries.md',
        filename: 'Groceries.md'
    }

    test('keeps the filename when the title is unchanged', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })

        const plan = planNoteUpdate({ note: previous, previous, uri: REPO_URI }, storage)

        expect(plan.renamed).toBe(false)
        expect(plan.filename).toBe('Groceries.md')
        expect(plan.existing).toMatchObject({ name: 'Groceries.md' })
    })

    test('reuses the known file without listing the folder when the title is unchanged', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const located = { ...previous, fileUri: HANDLE.uri }

        const plan = planNoteUpdate({ note: located, previous: located, uri: REPO_URI }, storage)

        expect(plan.existing).toBe(HANDLE)
        expect(plan.path).toBe(previous.path)
        expect(storage.listMarkdownFiles).not.toHaveBeenCalled()
    })

    test('lists the folder when the known file is gone', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const stale = { ...previous, fileUri: 'file:///repo/stale.md' }

        const plan = planNoteUpdate({ note: stale, previous: stale, uri: REPO_URI }, storage)

        expect(plan.existing).toMatchObject({ name: 'Groceries.md' })
        expect(storage.listMarkdownFiles).toHaveBeenCalledTimes(1)
    })

    test('lists the folder to validate the name when the title changes', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const located = { ...previous, fileUri: HANDLE.uri }

        planNoteUpdate(
            { note: { ...located, title: 'Shopping' }, previous: located, uri: REPO_URI },
            storage
        )

        expect(storage.listMarkdownFiles).toHaveBeenCalledTimes(1)
    })

    test('flags a rename when the title changes', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })

        const plan = planNoteUpdate(
            { note: { ...previous, title: 'Shopping' }, previous, uri: REPO_URI },
            storage
        )

        expect(plan.renamed).toBe(true)
        expect(plan.path).toBe('repo-1::Shopping.md')
    })

    test('throws a duplicate title error when another note owns the title', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x', 'Shopping.md': 'y' })

        expect(() => planNoteUpdate(
            { note: { ...previous, title: 'Shopping' }, previous, uri: REPO_URI },
            storage
        )).toThrow(expect.objectContaining({ code: 'DUPLICATE_TITLE' }))
    })
})

describe('persist note update', () => {
    const previous = {
        ...createNoteDraft(),
        path: 'repo-1::Groceries.md',
        filename: 'Groceries.md'
    }

    test('renames the file and its versions before writing the new content', async () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const note = { ...previous, title: 'Shopping', note: 'bread' }
        const plan = planNoteUpdate({ note, previous, uri: REPO_URI }, storage)

        const times = await persistNoteUpdate(
            { note, previous, uri: REPO_URI, plan, repositories: REPOSITORIES },
            storage
        )

        expect(storage.files.has('Groceries.md')).toBe(false)
        expect(storage.calls.versions).toEqual([['Groceries.md', 'Shopping.md']])
        expect(parseFrontmatter(storage.files.get('Shopping.md')).body).toBe('bread')
        expect(times).toEqual({ createdAt: 10, updatedAt: 20, merged: null })
    })

    test('only rewrites the content when the title is unchanged', async () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const note = { ...previous, note: 'bread' }
        const plan = planNoteUpdate({ note, previous, uri: REPO_URI }, storage)

        await persistNoteUpdate(
            { note, previous, uri: REPO_URI, plan, repositories: REPOSITORIES },
            storage
        )

        expect(storage.calls.versions).toEqual([])
    })
})

describe('persist note update with external edits', () => {
    const base = 'alpha beta gamma delta epsilon zeta eta theta iota kappa lambda'
    const previous = {
        ...createNoteDraft({ note: base }),
        path: 'repo-1::Groceries.md',
        filename: 'Groceries.md',
        updatedAt: 20
    }

    const createDiskFile = (content, lastModified) => ({
        name: 'Groceries.md',
        lastModified,
        text: jest.fn(async () => content)
    })

    const persist = (note, disk) => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const plan = { filename: 'Groceries.md', renamed: false, existing: disk }

        return {
            storage,
            run: () => persistNoteUpdate(
                { note, previous, uri: REPO_URI, plan, repositories: REPOSITORIES },
                storage
            )
        }
    }

    test('does not read the file when the timestamp is unchanged', async () => {
        const disk = createDiskFile(base, 20)
        const { run } = persist({ ...previous, note: 'edited' }, disk)

        const { merged } = await run()

        expect(disk.text).not.toHaveBeenCalled()
        expect(merged).toBeNull()
    })

    test('writes the draft when only the timestamp changed', async () => {
        const disk = createDiskFile(`---\ntags: []\n---\n\n${base}`, 30)
        const { run, storage } = persist({ ...previous, note: `${base} typed` }, disk)

        const { merged } = await run()

        expect(merged).toBeNull()
        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe(`${base} typed`)
    })

    test('combines edits made in different parts of the note', async () => {
        const disk = createDiskFile(base.replace('gamma', 'GAMMA'), 30)
        const { run, storage } = persist({ ...previous, note: `${base} typed` }, disk)

        const { merged } = await run()
        const expected = `${base.replace('gamma', 'GAMMA')} typed`

        expect(merged.note).toBe(expected)
        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe(expected)
    })

    test('keeps the draft when the external text cannot be merged', async () => {
        const draft = 'the quick brown fox jumps over the lazy dog and runs far away'
        const disk = createDiskFile(base.replace('gamma', 'GAMMA'), 30)
        const { run, storage } = persist({ ...previous, note: draft }, disk)

        await run()

        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe(draft)
    })
})

describe('plan wiki link rename', () => {
    const buildNote = (title, note) => ({
        title,
        note,
        filename: `${title}.md`,
        path: `repo-1::${title}.md`,
        repositoryId: 'repo-1'
    })

    const target = buildNote('Old', 'self [[Old]]')
    const linker = buildNote('Linker', 'see [[Old]]')
    const other = buildNote('Other', 'nothing')

    test('rewrites links only in notes that reference the target', () => {
        const { changedNotes } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, linker, other],
            notePaths: new Map()
        })

        expect(changedNotes.map((note) => note.path)).toEqual([linker.path])
        expect(changedNotes[0].note).toBe('see [[New]]')
    })

    test('rewrites the current content of notes edited after the snapshot', () => {
        const edited = { ...linker, note: 'edited [[Old]] again' }

        const { changedNotes } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, linker],
            notePaths: new Map(),
            currentNotes: [target, edited]
        })

        expect(changedNotes[0].note).toBe('edited [[New]] again')
    })

    test('never rewrites the target note itself', () => {
        const { renameNote } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target],
            notePaths: new Map()
        })

        expect(renameNote(target)).toBe(target)
    })
})

describe('write changed notes', () => {
    test('writes each note into its own repository and skips unknown ones', () => {
        const storage = createFakeStorage()
        const writes = []
        storage.writeNoteFile = (uri, filename) => writes.push([uri, filename])

        writeChangedNotes(
            [
                { repositoryId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { repositoryId: 'missing', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(writes).toEqual([[REPO_URI, 'A.md']])
    })

    test('skips and reports notes whose file changed outside the app', () => {
        const storage = createFakeStorage()
        const writes = []
        storage.getExistingFile = () => ({ lastModified: 99 })
        storage.writeNoteFile = (_uri, filename) => writes.push(filename)

        const failed = writeChangedNotes(
            [
                {
                    path: 'p/A',
                    repositoryId: 'repo-1',
                    filename: 'A.md',
                    fileUri: 'u',
                    updatedAt: 1,
                    note: 'a'
                }
            ],
            REPOSITORIES,
            storage
        )

        expect(failed).toEqual(['p/A'])
        expect(writes).toEqual([])
    })

    test('keeps writing the remaining notes and reports the ones that failed', () => {
        const storage = createFakeStorage()
        const writes = []
        storage.writeNoteFile = (_uri, filename) => {
            if (filename === 'A.md') throw new Error('disk full')
            writes.push(filename)
        }

        const failed = writeChangedNotes(
            [
                { path: 'p/A', repositoryId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { path: 'p/B', repositoryId: 'repo-1', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(failed).toEqual(['p/A'])
        expect(writes).toEqual(['B.md'])
    })
})

describe('with optimistic update', () => {
    const createStateHolder = (initial) => {
        const holder = { value: initial }
        holder.set = (update) => { holder.value = update(holder.value) }
        return holder
    }

    test('applies the update and returns the persist result', async () => {
        const state = createStateHolder([1])

        const result = await withOptimisticUpdate(
            state.set,
            { apply: (prev) => [...prev, 2], rollback: (prev) => prev },
            async () => 'done'
        )

        expect(result).toBe('done')
        expect(state.value).toEqual([1, 2])
    })

    test('rolls back and rethrows when persisting fails', async () => {
        const state = createStateHolder([1])

        await expect(withOptimisticUpdate(
            state.set,
            { apply: (prev) => [...prev, 2], rollback: () => [1] },
            async () => { throw new Error('boom') }
        )).rejects.toThrow('boom')

        expect(state.value).toEqual([1])
    })
})
