import { render } from '@testing-library/react-native'

import { ErrorBoundary } from '../error-boundary'
import { THEMES } from '@/constants/themes'

let mockTheme = null

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/utils/log-error', () => ({
    logError: jest.fn()
}))
jest.mock('@/ui/message-screen', () => ({
    MessageScreen: ({ children }) => children
}))
jest.mock('@/ui/button/filled-button', () => {
    const { useTheme } = jest.requireActual('@/ui/hooks/use-theme')

    return {
        FilledButton: () => {
            mockTheme = useTheme()
            return null
        }
    }
})

describe('error boundary', () => {
    test('gives its button a complete theme outside the app provider', async () => {
        await render(<ErrorBoundary error={new Error('boom')} retry={jest.fn()} />)

        expect(Object.values(THEMES).map((theme) => theme.colors)).toContainEqual(mockTheme.colors)
    })
})
