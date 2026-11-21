import {
    createNote,
    getFolderUri,
    persistNoteMove,
    persistNoteUpdate,
    planMovedNoteLinks,
    planNoteUpdate,
    planWikiLinkRename,
    withOptimisticUpdate,
    writeChangedNotes
} from '../note-operations'
import { parseFrontmatter } from '../frontmatter'
import { noteBodies } from '../note-body'
import * as noteVersions from '../note-versions'

const REPO_URI = 'file:///repo'
const REPOSITORIES = [{ id: 'repo-1', uri: REPO_URI }]

const HANDLE = { name: 'Groceries.md', uri: 'file:///repo/Groceries.md' }

const createFakeStorage = (initialFiles = {}) => {
    const files = new Map(Object.entries(initialFiles))
    const calls = { versions: [] }

    return {
        files,
        calls,
        fileExists: jest.fn((_uri, name) => files.has(name)),
        findFile: jest.fn((_uri, name) => (
            files.has(name)
                ? { name, uri: `${REPO_URI}/${name}`, delete: () => files.delete(name) }
                : undefined
        )),
        getExistingFile: jest.fn((fileUri) => {
            const name = fileUri?.slice(REPO_URI.length + 1)
            if (!files.has(name)) return undefined

            return {
                name,
                uri: fileUri,
                delete: () => files.delete(name)
            }
        }),
        writeNoteFile: (_uri, filename, content) => {
            files.set(filename, content)
            return { creationTime: 10, lastModified: 20 }
        },
        saveNoteFile: async ({ filename, content }) => {
            files.set(filename, content)
            return { fileUri: `${REPO_URI}/${filename}`, updatedAt: 20 }
        },
        saveRenamedNoteFile: async ({ from, to, content }) => {
            files.delete(from)
            files.set(to, content)
            return { fileUri: `${REPO_URI}/${to}`, updatedAt: 20 }
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
    folderId: 'repo-1',
    ...overrides
})

describe('get folder uri', () => {
    test('returns the uri of the matching repository', () => {
        expect(getFolderUri(REPOSITORIES, 'repo-1')).toBe(REPO_URI)
    })

    test('returns undefined when the folder is unknown', () => {
        expect(getFolderUri(REPOSITORIES, 'missing')).toBeUndefined()
    })
})

describe('create note', () => {
    test('writes the file and returns the record with its location and times', async () => {
        const storage = createFakeStorage()

        const { record, result } = await createNote(
            { note: createNoteDraft(), folderId: 'repo-1', uri: REPO_URI },
            storage
        )

        expect(result).toEqual({
            path: 'repo-1::Groceries.md',
            filename: 'Groceries.md',
            fileUri: `${REPO_URI}/Groceries.md`,
            createdAt: 20,
            updatedAt: 20
        })
        expect(record.path).toBe('repo-1::Groceries.md')
        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe('milk')
    })

    test('keeps the record in memory only when there is no folder uri', async () => {
        const storage = createFakeStorage()

        const { record, result } = await createNote(
            { note: createNoteDraft(), folderId: 'repo-1', uri: undefined },
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

    test('reuses the known file without looking it up by name when the title is unchanged', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const located = { ...previous, fileUri: HANDLE.uri }

        const plan = planNoteUpdate({ note: located, previous: located, uri: REPO_URI }, storage)

        expect(plan.existing).toMatchObject(HANDLE)
        expect(plan.path).toBe(previous.path)
        expect(storage.findFile).not.toHaveBeenCalled()
    })

    test('looks the file up by name when the known file is gone', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const stale = { ...previous, fileUri: 'file:///repo/stale.md' }

        const plan = planNoteUpdate({ note: stale, previous: stale, uri: REPO_URI }, storage)

        expect(plan.existing).toMatchObject({ name: 'Groceries.md' })
        expect(storage.findFile).toHaveBeenCalledTimes(1)
    })

    test('checks the new name by lookup when the title changes', () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const located = { ...previous, fileUri: HANDLE.uri }

        planNoteUpdate(
            { note: { ...located, title: 'Shopping' }, previous: located, uri: REPO_URI },
            storage
        )

        expect(storage.fileExists).toHaveBeenCalledWith(REPO_URI, 'Shopping.md')
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
            { note, previous, uri: REPO_URI, plan, folders: REPOSITORIES },
            storage
        )

        expect(storage.files.has('Groceries.md')).toBe(false)
        expect(storage.calls.versions).toEqual([['Groceries.md', 'Shopping.md']])
        expect(parseFrontmatter(storage.files.get('Shopping.md')).body).toBe('bread')
        expect(times).toEqual({
            fileUri: `${REPO_URI}/Shopping.md`,
            updatedAt: 20,
            merged: null
        })
    })

    test('only rewrites the content when the title is unchanged', async () => {
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const note = { ...previous, note: 'bread' }
        const plan = planNoteUpdate({ note, previous, uri: REPO_URI }, storage)

        await persistNoteUpdate(
            { note, previous, uri: REPO_URI, plan, folders: REPOSITORIES },
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
                { note, previous, uri: REPO_URI, plan, folders: REPOSITORIES },
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

    test('merges with the pinned base body of a note opened without one', async () => {
        const opened = { ...previous, path: 'repo-1::Pinned.md', note: undefined }
        noteBodies.pin(opened, base)
        const disk = createDiskFile(base.replace('gamma', 'GAMMA'), 30)
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const plan = { filename: 'Groceries.md', renamed: false, existing: disk }

        const { merged } = await persistNoteUpdate(
            { note: { ...opened, note: `${base} typed` }, previous: opened, uri: REPO_URI, plan, folders: REPOSITORIES },
            storage
        )

        expect(merged.note).toBe(`${base.replace('gamma', 'GAMMA')} typed`)
    })

    test('keeps the external text in the versions when the base body is unknown', async () => {
        const commit = jest.spyOn(noteVersions, 'commitNoteVersion').mockResolvedValue()
        const opened = { ...previous, path: 'repo-1::Unknown.md', note: undefined }
        const external = base.replace('gamma', 'GAMMA')
        const disk = createDiskFile(external, 30)
        const storage = createFakeStorage({ 'Groceries.md': 'x' })
        const plan = { filename: 'Groceries.md', renamed: false, existing: disk }

        const { merged } = await persistNoteUpdate(
            { note: { ...opened, note: `${base} typed` }, previous: opened, uri: REPO_URI, plan, folders: REPOSITORIES },
            storage
        )

        expect(merged).toBeNull()
        expect(commit).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'Groceries.md', opened.title, external)
        expect(parseFrontmatter(storage.files.get('Groceries.md')).body).toBe(`${base} typed`)
        commit.mockRestore()
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
        folderId: 'repo-1'
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

    test('rewrites the loaded body of a note that has none in memory', () => {
        const bodyless = { ...linker, note: undefined }
        const bodies = new Map([[linker.path, 'see [[Old]]']])

        const { changedNotes } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, bodyless],
            notePaths: new Map(),
            bodies
        })

        expect(changedNotes.map((note) => note.path)).toEqual([linker.path])
        expect(changedNotes[0].note).toBe('see [[New]]')
    })

    test('only rewrites the notes whose bodies were loaded as linking candidates', () => {
        const resident = { ...other, note: 'see [[Old]] too' }
        const bodies = new Map([[linker.path, 'see [[Old]]']])
        const rewrite = jest.fn((content) => content.replace('[[Old]]', '[[New]]'))

        const { changedNotes } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, linker, resident],
            notePaths: new Map(),
            rewrite,
            bodies
        })

        expect(rewrite).toHaveBeenCalledTimes(1)
        expect(changedNotes.map((note) => note.path)).toEqual([linker.path])
    })

    test('the returned renamer skips the notes whose bodies were not loaded', () => {
        const resident = { ...other, note: 'see [[Old]] too' }
        const bodies = new Map([[linker.path, 'see [[Old]]']])
        const rewrite = jest.fn((content) => content)

        const { renameNote } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, linker, resident],
            notePaths: new Map(),
            rewrite,
            bodies
        })

        rewrite.mockClear()

        expect(renameNote(resident)).toBe(resident)
        expect(rewrite).not.toHaveBeenCalled()
    })

    test('leaves a note without a loaded body untouched', () => {
        const bodyless = { ...other, note: undefined }

        const { changedNotes } = planWikiLinkRename({
            targetPath: target.path,
            newTitle: 'New',
            notes: [target, bodyless],
            notePaths: new Map()
        })

        expect(changedNotes).toEqual([])
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
    const stampsFor = (files) => files.map((file) => ({
        fileUri: `${REPO_URI}/${file.filename}`,
        updatedAt: 5
    }))

    test('writes each note into its own folder and skips unknown ones', async () => {
        const storage = createFakeStorage()
        const calls = []
        storage.saveNoteFiles = async ({ directoryUri, files }) => {
            calls.push([directoryUri, files.map((file) => file.filename)])
            return stampsFor(files)
        }

        await writeChangedNotes(
            [
                { folderId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { folderId: 'missing', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(calls).toEqual([[REPO_URI, ['A.md']]])
    })

    test('saves every note of a folder with one call', async () => {
        const storage = createFakeStorage()
        const calls = []
        storage.saveNoteFiles = async ({ files }) => {
            calls.push(files.length)
            return stampsFor(files)
        }

        await writeChangedNotes(
            [
                { folderId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { folderId: 'repo-1', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(calls).toEqual([2])
    })

    test('passes the known modified time so outside edits are not overwritten', async () => {
        const storage = createFakeStorage()
        const expected = []
        storage.saveNoteFiles = async ({ files }) => {
            expected.push(...files.map((file) => file.expectedModified))
            return stampsFor(files)
        }

        await writeChangedNotes(
            [{ folderId: 'repo-1', filename: 'A.md', updatedAt: 7, note: 'a', tags: [] }],
            REPOSITORIES,
            storage
        )

        expect(expected).toEqual([7])
    })

    test('returns the new location and time of every saved note', async () => {
        const storage = createFakeStorage()
        storage.saveNoteFiles = async ({ files }) => stampsFor(files)

        const { failed, saved } = await writeChangedNotes(
            [{ path: 'p/A', folderId: 'repo-1', filename: 'A.md', note: 'a', tags: [] }],
            REPOSITORIES,
            storage
        )

        expect(failed).toEqual([])
        expect(saved.get('p/A')).toEqual({ fileUri: `${REPO_URI}/A.md`, updatedAt: 5 })
    })

    test('reports the notes whose file could not be saved and keeps the others', async () => {
        const storage = createFakeStorage()
        storage.saveNoteFiles = async ({ files }) => files.map((file, index) => (
            index === 0 ? null : { fileUri: `${REPO_URI}/${file.filename}`, updatedAt: 5 }
        ))

        const { failed, saved } = await writeChangedNotes(
            [
                { path: 'p/A', folderId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { path: 'p/B', folderId: 'repo-1', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(failed).toEqual(['p/A'])
        expect([...saved.keys()]).toEqual(['p/B'])
    })

    test('reports every note of the folder when the whole call fails', async () => {
        const storage = createFakeStorage()
        storage.saveNoteFiles = async () => { throw new Error('bridge down') }

        const { failed, saved } = await writeChangedNotes(
            [
                { path: 'p/A', folderId: 'repo-1', filename: 'A.md', note: 'a', tags: [] },
                { path: 'p/B', folderId: 'repo-1', filename: 'B.md', note: 'b', tags: [] }
            ],
            REPOSITORIES,
            storage
        )

        expect(failed).toEqual(['p/A', 'p/B'])
        expect(saved.size).toBe(0)
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

describe('persist note move', () => {
    const MOVE_FOLDERS = [
        { id: 'root', uri: 'file:///root', alias: 'Root' },
        { id: 'child', uri: 'file:///root/Child', alias: 'Child', parentId: 'root' },
        { id: 'other', uri: 'file:///other', alias: 'Other' }
    ]

    const createMoveStorage = (status = 'moved') => ({
        moveNote: jest.fn(async () => ({
            status,
            fileUri: 'file:///root/Child/Idea.md',
            updatedAt: 99
        }))
    })

    const NOTE = { path: 'root::Idea.md', filename: 'Idea.md', title: 'Idea', folderId: 'root' }

    test('moves the file and its version history to the destination folder natively', async () => {
        const storage = createMoveStorage()

        await persistNoteMove({ note: NOTE, destinationId: 'child', folders: MOVE_FOLDERS }, storage)

        expect(storage.moveNote).toHaveBeenCalledWith({
            rootUri: 'file:///root',
            filename: 'Idea.md',
            from: { folderId: 'root', path: '' },
            to: { folderId: 'child', path: 'Child', uri: 'file:///root/Child' }
        })
    })

    test('returns the new location of the note', async () => {
        const result = await persistNoteMove(
            { note: NOTE, destinationId: 'child', folders: MOVE_FOLDERS },
            createMoveStorage()
        )

        expect(result).toEqual({
            folderId: 'child',
            filename: 'Idea.md',
            path: 'child::Idea.md',
            fileUri: 'file:///root/Child/Idea.md',
            updatedAt: 99
        })
    })

    test('throws a duplicate-title error when the destination has the same filename', async () => {
        const storage = createMoveStorage('targetExists')

        await expect(
            persistNoteMove({ note: NOTE, destinationId: 'child', folders: MOVE_FOLDERS }, storage)
        ).rejects.toMatchObject({ code: 'DUPLICATE_TITLE' })
    })

    test('throws when the note no longer exists', async () => {
        const storage = createMoveStorage('sourceMissing')

        await expect(
            persistNoteMove({ note: NOTE, destinationId: 'child', folders: MOVE_FOLDERS }, storage)
        ).rejects.toThrow()
    })

    test('refuses to move a note to a different folder tree', async () => {
        const storage = createMoveStorage()

        await expect(
            persistNoteMove({ note: NOTE, destinationId: 'other', folders: MOVE_FOLDERS }, storage)
        ).rejects.toThrow()
        expect(storage.moveNote).not.toHaveBeenCalled()
    })
})

describe('plan moved note links', () => {
    const REPOSITORIES_WITH_FOLDER = [
        { id: 'root', uri: 'file:///root', alias: 'Root' },
        { id: 'child', uri: 'file:///root/Child', alias: 'Child', parentId: 'root' }
    ]

    const moved = { path: 'root::Idea.md', title: 'Idea', folderId: 'root', note: '' }
    const twin = { path: 'child::Idea.md', title: 'Idea', folderId: 'child', note: '' }
    const linker = { path: 'root::Index.md', title: 'Index', folderId: 'root', note: 'See [[Idea]]' }
    const NOTES = [moved, twin, linker]
    const NOTE_PATHS = new Map([['root::Idea.md', ''], ['child::Idea.md', 'Child'], ['root::Index.md', '']])

    test('qualifies links with the new folder when the title exists elsewhere', () => {
        const plan = planMovedNoteLinks({
            note: moved,
            destinationId: 'child',
            notes: NOTES,
            notePaths: NOTE_PATHS,
            folders: REPOSITORIES_WITH_FOLDER,
            currentNotes: NOTES
        })

        expect(plan.changedNotes).toHaveLength(1)
        expect(plan.changedNotes[0].note).toBe('See [[Child/Idea|Idea]]')
    })

    test('leaves links alone when the title is unique', () => {
        const unique = [moved, linker]

        const plan = planMovedNoteLinks({
            note: moved,
            destinationId: 'child',
            notes: unique,
            notePaths: new Map([['root::Idea.md', ''], ['root::Index.md', '']]),
            folders: REPOSITORIES_WITH_FOLDER,
            currentNotes: unique
        })

        expect(plan.changedNotes).toEqual([])
    })
})
