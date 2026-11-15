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

    test('indexes every repository in the tree in order', async () => {
        const fs = buildFs()
        const sync = createRepositoryIndexSync(fs)

        await sync([root, child], [root, child])

        expect(fs.indexRepository.mock.calls).toEqual([
            ['root', 'file:///root'],
            ['child', 'file:///root/child']
        ])
    })

    test('prunes the index of repositories that no longer exist', async () => {
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

        await expect(sync([root, child], [root, child])).resolves.toBeUndefined()

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
})
