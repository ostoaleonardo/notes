import { Text } from 'react-native'
import { act, renderRouter, waitFor } from 'expo-router/testing-library'

import App from '../../../app/(app)/index'
import DailyNote from '../../../app/(app)/(drawer)/(workspace)/notes/daily'
import NotFound from '../../../app/+not-found'

import { NOT_FOUND_REDIRECT_DELAY } from '@/constants/default-values'

const mockState = {
    loading: false,
    activeRepository: { id: 'repo' },
    dailyPath: null
}

const mockGetItem = jest.fn(() => Promise.resolve(null))
const mockOpenDailyNote = jest.fn(() => Promise.resolve(mockState.dailyPath))

jest.mock('@/hooks/use-notes', () => ({
    useNotes: () => ({ loading: mockState.loading })
}))

jest.mock('@/hooks/use-current-note', () => ({
    useCurrentNote: () => ({ currentId: null })
}))

jest.mock('@/hooks/use-repositories', () => ({
    useRepositories: () => ({ activeRepository: mockState.activeRepository })
}))

jest.mock('@/hooks/use-storage', () => ({
    useStorage: () => ({ getItem: mockGetItem })
}))

jest.mock('@/hooks/use-daily-note', () => ({
    useDailyNote: () => mockOpenDailyNote
}))

const screens = {
    'repository-gate': () => <Text>gate</Text>,
    'home/index': () => <Text>home</Text>,
    'notes/[slug]': () => <Text>note</Text>
}

afterEach(() => jest.useRealTimers())

beforeEach(() => {
    mockState.loading = false
    mockState.activeRepository = { id: 'repo' }
    mockState.dailyPath = null
})

describe('startup route', () => {
    test('shows the repository gate while there is no active repository', async () => {
        mockState.activeRepository = null

        const app = renderRouter({ index: App, ...screens })
        await app

        await waitFor(() => expect(app).toHavePathname('/repository-gate'))
    })
})

describe('daily note route', () => {
    test('replaces itself with the editor of the daily note', async () => {
        mockState.dailyPath = '2026-10-04.md'

        const app = renderRouter(
            { index: () => null, 'notes/daily': DailyNote, ...screens },
            { initialUrl: '/notes/daily' }
        )
        await app
        await app

        await waitFor(() => expect(app).toHavePathname('/notes/2026-10-04.md'))
    })
})

describe('not found route', () => {
    test('sends the user home after the redirect delay', async () => {
        const app = renderRouter({ '+not-found': NotFound, ...screens }, { initialUrl: '/missing' })
        await app

        expect(app).toHavePathname('/missing')

        await act(async () => {
            jest.advanceTimersByTime(NOT_FOUND_REDIRECT_DELAY)
        })

        expect(app).toHavePathname('/home')
    })
})
