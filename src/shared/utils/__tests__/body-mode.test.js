import { createBodylessCheck } from '../body-mode'

jest.mock('repository-engine', () => ({ __esModule: true, default: {} }))

describe('decide whether a repository is loaded without note bodies', () => {
    test('is bodyless from the minimum number of indexed notes', async () => {
        const check = createBodylessCheck({ count: async () => 5000, minNotes: 5000 })

        expect(await check(['repo'])).toBe(true)
    })

    test('keeps the bodies of a smaller repository', async () => {
        const check = createBodylessCheck({ count: async () => 4999, minNotes: 5000 })

        expect(await check(['repo'])).toBe(false)
    })

    test('keeps the bodies when the index cannot be counted', async () => {
        const check = createBodylessCheck({
            count: async () => { throw new Error('no index') },
            minNotes: 1
        })

        expect(await check(['repo'])).toBe(false)
    })

    test('asks for the folders it was given', async () => {
        const count = jest.fn(async () => 0)

        await createBodylessCheck({ count })(['a', 'b'])

        expect(count).toHaveBeenCalledWith(['a', 'b'])
    })
})
