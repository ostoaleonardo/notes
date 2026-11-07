import {
    clearVersionHistorySession,
    getVersionHistorySession,
    openVersionHistory
} from '../version-history-session'
import { pushOnce } from '@/utils/navigation'

import { ROUTES } from '@/constants/routes'

jest.mock('@/utils/navigation', () => ({
    pushOnce: jest.fn()
}))

describe('version history session', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        clearVersionHistorySession()
    })

    test('stores the session and navigates to the history screen', () => {
        const session = { noteId: 'note-1' }

        openVersionHistory(session)

        expect(getVersionHistorySession()).toBe(session)
        expect(pushOnce).toHaveBeenCalledWith(ROUTES.VERSION_HISTORY)
    })

    test('forgets the session once it is cleared', () => {
        openVersionHistory({ noteId: 'note-1' })

        clearVersionHistorySession()

        expect(getVersionHistorySession()).toBeNull()
    })
})
