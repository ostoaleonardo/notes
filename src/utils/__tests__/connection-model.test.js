import {
    ROOT_ENTITY,
    buildConnectionModel,
    entityExists,
    entityTitle,
    findFileReferences,
    listOriginOptions,
    listRelations,
    makeEntity,
    parseEntityKey,
    entityKey,
    summarizeConnections
} from '../connection-model'
import {
    MOCK_CONNECTION_FILES,
    MOCK_CONNECTION_NOTES,
    MOCK_CONNECTION_NOTE_PATHS
} from '../__fixtures__/connections'
import { CONNECTION_SECTIONS, CONNECTION_TYPES } from '@/constants/connections'

const { NOTE, FILE, TAG, FOLDER, MISSING } = CONNECTION_TYPES

const model = buildConnectionModel({
    notes: MOCK_CONNECTION_NOTES,
    notePaths: MOCK_CONNECTION_NOTE_PATHS,
    files: MOCK_CONNECTION_FILES,
    rootName: 'Vault'
})

const section = (entity, key) => listRelations(entity, model).find((item) => item.key === key)

const ids = (entities = []) => entities.map((entity) => entity.id)

describe('find file references', () => {
    test('resolves embedded and linked files by name', () => {
        const found = findFileReferences('![[photo.png]] and [[spec.pdf]]', MOCK_CONNECTION_FILES)

        expect(found.map((file) => file.id)).toEqual(['file:photo', 'file:spec'])
    })

    test('ignores files that do not exist and links to notes', () => {
        expect(findFileReferences('[[missing.png]] [[Alpha]]', MOCK_CONNECTION_FILES)).toEqual([])
    })

    test('ignores references inside code', () => {
        expect(findFileReferences('`[[photo.png]]`', MOCK_CONNECTION_FILES)).toEqual([])
    })
})

describe('build connection model', () => {
    test('records resolved links in both directions', () => {
        expect(model.incoming.get('r::Alpha.md')).toEqual(['r::Index.md', 'd::Gamma.md'])
        expect(model.incoming.get('r::Index.md')).toEqual(['r::Alpha.md'])
    })

    test('collects unresolved links with the notes that use them', () => {
        expect(model.unresolved.get('missing:ghost').sources).toEqual(['r::Index.md'])
    })

    test('maps notes to the files they use and back', () => {
        expect(model.noteFiles.get('r::Index.md')).toEqual(['file:photo'])
        expect(model.fileNotes.get('file:spec')).toEqual(['d::Gamma.md'])
    })

    test('maps tags to their notes', () => {
        expect(model.tagNotes.get('work')).toEqual(['r::Index.md', 'r::Alpha.md'])
    })
})

describe('list relations', () => {
    test('lists links, backlinks, tags and files of a note', () => {
        const note = makeEntity(NOTE, 'r::Index.md')

        expect(ids(section(note, CONNECTION_SECTIONS.LINKS_OUT).entities)).toEqual([
            'r::Alpha.md',
            'missing:ghost'
        ])
        expect(ids(section(note, CONNECTION_SECTIONS.LINKS_IN).entities)).toEqual(['r::Alpha.md'])
        expect(ids(section(note, CONNECTION_SECTIONS.TAGS).entities)).toEqual(['work', 'ideas'])
        expect(ids(section(note, CONNECTION_SECTIONS.FILES).entities)).toEqual(['file:photo'])
    })

    test('omits empty sections', () => {
        const keys = listRelations(makeEntity(NOTE, 'r::Lonely.md'), model)

        expect(keys).toEqual([])
    })

    test('lists the notes that share a tag with related tags and files', () => {
        const tag = makeEntity(TAG, 'ideas')

        expect(ids(section(tag, CONNECTION_SECTIONS.NOTES).entities)).toEqual([
            'd::Gamma.md',
            'r::Index.md'
        ])
        expect(ids(section(tag, CONNECTION_SECTIONS.RELATED_TAGS).entities)).toEqual(['work'])
        expect(ids(section(tag, CONNECTION_SECTIONS.FILES).entities)).toEqual([
            'file:photo',
            'file:spec'
        ])
    })

    test('lists the notes that use a file', () => {
        const file = makeEntity(FILE, 'file:photo')

        expect(ids(section(file, CONNECTION_SECTIONS.NOTES).entities)).toEqual(['r::Index.md'])
    })

    test('lists the notes that link to an unresolved target', () => {
        const missing = makeEntity(MISSING, 'missing:ghost')

        expect(ids(section(missing, CONNECTION_SECTIONS.LINKS_IN).entities))
            .toEqual(['r::Index.md'])
    })

    test('lists subfolders, notes and files of a folder', () => {
        const folder = makeEntity(FOLDER, 'Projects')

        expect(ids(section(folder, CONNECTION_SECTIONS.FOLDERS).entities))
            .toEqual(['Projects/Deep'])
        expect(ids(section(folder, CONNECTION_SECTIONS.NOTES).entities)).toEqual(['p::Beta.md'])
        expect(ids(section(folder, CONNECTION_SECTIONS.FILES).entities)).toEqual(['file:spec'])
    })

    test('lists top level folders and the most used tags of the repository', () => {
        expect(ids(section(ROOT_ENTITY, CONNECTION_SECTIONS.FOLDERS).entities)).toEqual([
            'attachments',
            'Projects'
        ])
        expect(ids(section(ROOT_ENTITY, CONNECTION_SECTIONS.TAGS).entities))
            .toEqual(['ideas', 'work'])
    })
})

describe('entity helpers', () => {
    test('resolves a readable title for every entity type', () => {
        expect(entityTitle(ROOT_ENTITY, model)).toBe('Vault')
        expect(entityTitle(makeEntity(NOTE, 'r::Alpha.md'), model)).toBe('Alpha')
        expect(entityTitle(makeEntity(FILE, 'file:spec'), model)).toBe('spec.pdf')
        expect(entityTitle(makeEntity(FOLDER, 'Projects/Deep'), model)).toBe('Deep')
        expect(entityTitle(makeEntity(MISSING, 'missing:ghost'), model)).toBe('Ghost')
        expect(entityTitle(makeEntity(TAG, 'work'), model)).toBe('work')
    })

    test('detects entities that no longer exist', () => {
        expect(entityExists(makeEntity(NOTE, 'r::Alpha.md'), model)).toBe(true)
        expect(entityExists(makeEntity(NOTE, 'gone'), model)).toBe(false)
        expect(entityExists(makeEntity(FOLDER, 'Projects/Deep'), model)).toBe(true)
        expect(entityExists(makeEntity(FOLDER, 'Nowhere'), model)).toBe(false)
        expect(entityExists(makeEntity(TAG, 'nothing'), model)).toBe(false)
    })
})

describe('parse entity key', () => {
    test('round trips keys that contain separators', () => {
        const entity = makeEntity(NOTE, 'r::Index.md')

        expect(parseEntityKey(entityKey(entity))).toEqual(entity)
    })

    test('rejects text without a type', () => {
        expect(parseEntityKey('nothing')).toBeNull()
    })
})

describe('list origin options', () => {
    test('lists every folder along the path of notes and files', () => {
        expect(ids(listOriginOptions(FOLDER, model))).toEqual([
            'attachments',
            'Projects/Deep',
            'Projects'
        ])
    })

    test('lists notes sorted by title', () => {
        expect(ids(listOriginOptions(NOTE, model))).toEqual([
            'r::Alpha.md',
            'p::Beta.md',
            'd::Gamma.md',
            'r::Index.md',
            'r::Lonely.md'
        ])
    })

    test('lists tags alphabetically', () => {
        expect(ids(listOriginOptions(TAG, model))).toEqual(['ideas', 'work'])
    })
})

describe('summarize connections', () => {
    const summary = summarizeConnections(model)

    test('finds notes with no links in or out', () => {
        expect(summary.orphans.map((note) => note.title)).toEqual(['Beta', 'Lonely'])
    })

    test('computes the connected percentage', () => {
        expect(summary.connected).toBe(3)
        expect(summary.percent).toBe(60)
    })

    test('counts the notes that contain broken links', () => {
        expect(summary.brokenNotes).toBe(1)
    })

    test('lists unresolved targets', () => {
        expect(summary.unresolved.map((link) => link.title)).toEqual(['Ghost'])
    })

    test('reports a full score for an empty repository', () => {
        const empty = buildConnectionModel({ notes: [], notePaths: new Map(), files: [] })

        expect(summarizeConnections(empty).percent).toBe(100)
    })
})
