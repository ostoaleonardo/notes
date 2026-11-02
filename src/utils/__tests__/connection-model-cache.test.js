import { clearConnectionModelCache, getConnectionModel } from '../connection-model-cache'

const makeInput = (overrides = {}) => ({
    notes: [],
    notePaths: new Map(),
    files: [],
    rootName: 'root',
    ...overrides
})

beforeEach(() => {
    clearConnectionModelCache()
})

describe('same input', () => {
    test('reuses the model built before', () => {
        const input = makeInput()

        expect(getConnectionModel(input)).toBe(getConnectionModel({ ...input, files: [] }))
    })

    test('reuses the model when the files have the same ids', () => {
        const input = makeInput({ files: [{ id: 'a' }, { id: 'b' }] })
        const model = getConnectionModel(input)

        expect(getConnectionModel({ ...input, files: [{ id: 'a' }, { id: 'b' }] })).toBe(model)
    })
})

describe('changed input', () => {
    test('rebuilds the model when the notes change', () => {
        const input = makeInput()
        const model = getConnectionModel(input)

        expect(getConnectionModel({ ...input, notes: [] })).not.toBe(model)
    })

    test('rebuilds the model when the files change', () => {
        const input = makeInput({ files: [{ id: 'a' }] })
        const model = getConnectionModel(input)

        expect(getConnectionModel({ ...input, files: [{ id: 'b' }] })).not.toBe(model)
    })
})
