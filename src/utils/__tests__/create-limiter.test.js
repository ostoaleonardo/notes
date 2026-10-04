import { createLimiter } from '../create-limiter'

const createDeferred = () => {
    let resolve
    const promise = new Promise((done) => {
        resolve = done
    })

    return { promise, resolve }
}

describe('create limiter', () => {
    test('never runs more tasks at once than the limit', async () => {
        const limit = createLimiter(2)
        const gates = Array.from({ length: 5 }, createDeferred)
        let active = 0
        let peak = 0

        const results = gates.map((gate, index) => limit(async () => {
            active++
            peak = Math.max(peak, active)
            await gate.promise
            active--
            return index
        }))

        for (const gate of gates) {
            gate.resolve()
            await Promise.resolve()
        }

        expect(await Promise.all(results)).toEqual([0, 1, 2, 3, 4])
        expect(peak).toBe(2)
    })

    test('keeps running queued tasks after one fails', async () => {
        const limit = createLimiter(1)

        const failed = limit(() => Promise.reject(new Error('boom')))
        const succeeded = limit(() => Promise.resolve('ok'))

        await expect(failed).rejects.toThrow('boom')
        await expect(succeeded).resolves.toBe('ok')
    })
})
