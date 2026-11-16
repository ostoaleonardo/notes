import {
    getIndexingStatus,
    setIndexingStatus,
    subscribeIndexingStatus
} from '../indexing-status'

describe('indexing status', () => {
    test('notifies subscribers until they unsubscribe', () => {
        const listener = jest.fn()
        const unsubscribe = subscribeIndexingStatus(listener)

        setIndexingStatus({ progress: 0.5 })
        expect(getIndexingStatus()).toEqual({ progress: 0.5 })
        expect(listener).toHaveBeenCalledTimes(1)

        unsubscribe()
        setIndexingStatus(null)
        expect(listener).toHaveBeenCalledTimes(1)
    })
})
