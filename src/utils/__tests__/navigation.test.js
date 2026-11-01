import { router } from 'expo-router'

import { pushOnce, resetNavigationState, setCurrentRoute } from '../navigation'

import { NAVIGATION_LOCK_MS } from '@/constants/navigation'

jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}))

describe('push once', () => {
    beforeEach(() => {
        router.push.mockClear()
        resetNavigationState()
    })

    test('ignores the same route pushed twice in a row', () => {
        pushOnce('/settings', 1000)
        pushOnce('/settings', 1000 + NAVIGATION_LOCK_MS - 1)

        expect(router.push).toHaveBeenCalledTimes(1)
    })

    test('pushes the same route again after the lock expires', () => {
        pushOnce('/settings', 1000)
        pushOnce('/settings', 1000 + NAVIGATION_LOCK_MS)

        expect(router.push).toHaveBeenCalledTimes(2)
    })

    test('pushes a different route right away', () => {
        pushOnce('/settings', 1000)
        pushOnce('/connections', 1001)

        expect(router.push).toHaveBeenCalledTimes(2)
    })

    test('treats the same route with different params as different', () => {
        pushOnce({ pathname: '/notes/new', params: { repositoryId: 'a' } }, 1000)
        pushOnce({ pathname: '/notes/new', params: { repositoryId: 'b' } }, 1001)

        expect(router.push).toHaveBeenCalledTimes(2)
    })

    test('forwards the href to the router', () => {
        pushOnce('/settings', 1000)

        expect(router.push).toHaveBeenCalledWith('/settings')
    })

    test('ignores a route that is already the current one', () => {
        setCurrentRoute('/settings')
        pushOnce('/settings', 1000)

        expect(router.push).not.toHaveBeenCalled()
    })

    test('ignores the current route even when the href is encoded', () => {
        setCurrentRoute('/notes/My note')
        pushOnce('/notes/My%20note', 1000)

        expect(router.push).not.toHaveBeenCalled()
    })

    test('ignores the query string when checking the current route', () => {
        setCurrentRoute('/notes/a')
        pushOnce('/notes/a?anchor=x', 1000)

        expect(router.push).not.toHaveBeenCalled()
    })

    test('pushes the same pathname when the params differ', () => {
        setCurrentRoute('/notes/new', { repositoryId: 'a' })
        pushOnce({ pathname: '/notes/new', params: { repositoryId: 'b' } }, 1000)

        expect(router.push).toHaveBeenCalledTimes(1)
    })

    test('ignores the same pathname when the params match', () => {
        setCurrentRoute('/notes/new', { repositoryId: 'a' })
        pushOnce({ pathname: '/notes/new', params: { repositoryId: 'a' } }, 1000)

        expect(router.push).not.toHaveBeenCalled()
    })

    test('pushes a different route from the current one', () => {
        setCurrentRoute('/home')
        pushOnce('/settings', 1000)

        expect(router.push).toHaveBeenCalledTimes(1)
    })
})
