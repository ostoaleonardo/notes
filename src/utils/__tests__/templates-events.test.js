import { notifyTemplatesChanged, subscribeTemplatesChanged } from '../templates-events'

describe('templates events', () => {
    test('notifies subscribed listeners', () => {
        const listener = jest.fn()
        const unsubscribe = subscribeTemplatesChanged(listener)

        notifyTemplatesChanged()

        expect(listener).toHaveBeenCalledTimes(1)
        unsubscribe()
    })

    test('stops notifying after unsubscribe', () => {
        const listener = jest.fn()
        subscribeTemplatesChanged(listener)()

        notifyTemplatesChanged()

        expect(listener).not.toHaveBeenCalled()
    })
})
