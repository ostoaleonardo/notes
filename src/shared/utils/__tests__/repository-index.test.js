import { createRepositoryIndexSync } from '../repository-index'
import { logError } from '../log-error'

jest.mock('../log-error', () => ({
    logError: jest.fn()
}))

jest.mock('repository-fs', () => ({
    __esModule: true,
    default: {}
}))

const buildFs = () => ({
    pruneRepositoryIndex: jest.fn(async () => {}),
    indexRepository: jest.fn(async () => ({}))
})

const root = { id: 'root', uri: 'file:///root' }
const child = { id: 'child', uri: 'file:///root/child' }

describe('repository index sync', () => {
    beforeEach(() => {
        logError.mockClear()
    })

    test('indexes every folder in the tree in order', async () => {
        const fs = buildFs()
        const sync = createRepositoryIndexSync(fs)

        await sync([root, child], [root, child])

        expect(fs.indexRepository.mock.calls).toEqual([
            ['root', 'file:///root'],
            ['child', 'file:///root/child']
        ])
    })

    test('prunes the index of folders that no longer exist', async () => {
        const fs = buildFs()
        const sync = createRepositoryIndexSync(fs)

        await sync([root], [root, child])

        expect(fs.pruneRepositoryIndex).toHaveBeenCalledWith(['root', 'child'])
    })

    test('logs the failure and stops without throwing', async () => {
        const fs = buildFs()
        const failure = new Error('disk full')
        fs.indexRepository.mockRejectedValueOnce(failure)
        const sync = createRepositoryIndexSync(fs)

        await expect(sync([root, child], [root, child])).resolves.toBe(true)

        expect(logError).toHaveBeenCalledWith(expect.any(String), failure)
        expect(fs.indexRepository).toHaveBeenCalledTimes(1)
    })

    test('ignores a sync request while another one is running', async () => {
        const fs = buildFs()
        let release
        fs.indexRepository.mockImplementationOnce(() => new Promise((resolve) => { release = resolve }))
        const sync = createRepositoryIndexSync(fs)

        const first = sync([root], [root])
        await sync([root], [root])
        release({})
        await first

        expect(fs.indexRepository).toHaveBeenCalledTimes(1)
    })

    test('allows a new sync once the previous one finished', async () => {
        const fs = buildFs()
        const sync = createRepositoryIndexSync(fs)

        await sync([root], [root])
        await sync([root], [root])

        expect(fs.indexRepository).toHaveBeenCalledTimes(2)
    })

    test('reports no change when every folder is up to date', async () => {
        const fs = buildFs()
        fs.indexRepository.mockResolvedValue({ added: 0, updated: 0, removed: 0 })

        expect(await createRepositoryIndexSync(fs)([root, child], [root, child])).toBe(false)
    })

    test('reports a change when any folder added, updated or removed notes', async () => {
        const fs = buildFs()
        fs.indexRepository
            .mockResolvedValueOnce({ added: 0, updated: 0, removed: 0 })
            .mockResolvedValueOnce({ added: 0, updated: 2, removed: 0 })

        expect(await createRepositoryIndexSync(fs)([root, child], [root, child])).toBe(true)
    })

    test('assumes a change when the indexer returns no statistics', async () => {
        expect(await createRepositoryIndexSync(buildFs())([root], [root])).toBe(true)
    })

    test('assumes a change after a failure or while another sync is running', async () => {
        const fs = buildFs()
        fs.indexRepository.mockRejectedValueOnce(new Error('disk full'))
        const sync = createRepositoryIndexSync(fs)

        expect(await sync([root], [root])).toBe(true)

        let release
        fs.pruneRepositoryIndex.mockReturnValueOnce(new Promise((resolve) => { release = resolve }))
        const first = sync([root], [root])

        expect(await sync([root], [root])).toBe(true)

        release()
        await first
    })
})
