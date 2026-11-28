import { createNoteSaveQueue } from '../note-save-queue'

describe('note save queue', () => {
    test('runs the saves of one note in order', async () => {
        const queue = createNoteSaveQueue()
        const order = []
        let release
        const gate = new Promise((resolve) => { release = resolve })

        const first = queue.enqueue('a', async () => {
            await gate
            order.push('first')
        })
        const second = queue.enqueue('a', async () => order.push('second'))

        release()
        await Promise.all([first, second])

        expect(order).toEqual(['first', 'second'])
    })

    test('keeps running after a failed save', async () => {
        const queue = createNoteSaveQueue()

        const failed = queue.enqueue('a', async () => {
            throw new Error('disk full')
        })
        const next = queue.enqueue('a', async () => 'saved')

        await expect(failed).rejects.toThrow('disk full')
        await expect(next).resolves.toBe('saved')
    })

    test('prefers a newer saved stamp over the note in state', () => {
        const queue = createNoteSaveQueue()
        const note = { path: 'b', updatedAt: 1, fileUri: 'old' }

        queue.rememberStamp('a', 'b', { updatedAt: 5, fileUri: 'new' })

        expect(queue.withLatestStamp(note)).toEqual({ path: 'b', updatedAt: 5, fileUri: 'new' })
    })

    test('ignores a stamp older than the note in state', () => {
        const queue = createNoteSaveQueue()
        const note = { path: 'b', updatedAt: 9, fileUri: 'current' }

        queue.rememberStamp('a', 'b', { updatedAt: 5, fileUri: 'stale' })

        expect(queue.withLatestStamp(note)).toBe(note)
    })

    test('returns nothing for a missing note', () => {
        expect(createNoteSaveQueue().withLatestStamp(undefined)).toBeUndefined()
    })
})
