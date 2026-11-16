import { withBusy } from '../with-busy'

describe('with busy', () => {
    test('marks the ref busy while the function runs', async () => {
        const busyRef = { current: false }
        let busyDuring = null

        await withBusy(busyRef, async () => {
            busyDuring = busyRef.current
        })

        expect(busyDuring).toBe(true)
        expect(busyRef.current).toBe(false)
    })

    test('returns the function result', async () => {
        const result = await withBusy({ current: false }, async () => 42)

        expect(result).toBe(42)
    })

    test('releases the ref when the function throws', async () => {
        const busyRef = { current: false }

        await expect(withBusy(busyRef, async () => {
            throw new Error('fail')
        })).rejects.toThrow('fail')

        expect(busyRef.current).toBe(false)
    })
})
