import { describeEntity } from '../connection-caption'
import { buildConnectionModel, makeEntity, ROOT_ENTITY } from '../connection-model'
import {
    MOCK_CONNECTION_FILES,
    MOCK_CONNECTION_NOTES,
    MOCK_CONNECTION_NOTE_PATHS
} from '../__fixtures__/connections'
import { CONNECTION_TYPES } from '@/constants/connections'

const { NOTE, FILE, TAG, FOLDER, MISSING } = CONNECTION_TYPES

const model = buildConnectionModel({
    notes: MOCK_CONNECTION_NOTES,
    notePaths: MOCK_CONNECTION_NOTE_PATHS,
    files: MOCK_CONNECTION_FILES,
    rootName: 'Vault'
})

const t = (key, options) => (options ? `${key}:${options.count}` : key)

describe('describe entity', () => {
    test('shows the folder of a note or the repository name at the root', () => {
        expect(describeEntity(makeEntity(NOTE, 'd::Gamma.md'), model, t)).toBe('Projects/Deep')
        expect(describeEntity(makeEntity(NOTE, 'r::Index.md'), model, t)).toBe('Vault')
    })

    test('shows the folder of a file', () => {
        expect(describeEntity(makeEntity(FILE, 'file:photo'), model, t)).toBe('attachments')
    })

    test('counts the notes inside a repository, folder or tag', () => {
        expect(describeEntity(ROOT_ENTITY, model, t)).toBe('count.notes:5')
        expect(describeEntity(makeEntity(FOLDER, 'Projects'), model, t)).toBe('count.notes:2')
        expect(describeEntity(makeEntity(TAG, 'work'), model, t)).toBe('count.notes:2')
    })

    test('flags notes that do not exist yet', () => {
        const ghost = makeEntity(MISSING, 'missing:ghost')

        expect(describeEntity(ghost, model, t)).toBe('connections.not_found')
    })
})
