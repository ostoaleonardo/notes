import { act, render } from '@testing-library/react-native'

import { NameDialog } from '../name-dialog'

let mockName = 'Plan'
let mockConfirmProps = {}
let mockSecondaryProps = {}
let mockCancelProps = {}

jest.mock('@/hooks/use-dialog-input', () => ({
    useCreateDialogInput: () => [mockName, jest.fn(), !mockName.trim()]
}))
jest.mock('@/hooks/use-haptics', () => ({
    useHaptics: () => ({ vibrate: jest.fn() })
}))
jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/ui/dialog', () => ({
    Dialog: ({ confirm, dismiss, children }) => <>{confirm}{dismiss}{children}</>
}))
jest.mock('@/ui/input/filled-text-field', () => ({
    FilledTextField: () => null
}))
jest.mock('@/ui/button/text-button', () => ({
    TextButton: (props) => {
        mockCancelProps = props
        return null
    }
}))
jest.mock('@/ui/button/filled-button', () => ({
    FilledButton: (props) => {
        mockConfirmProps = props
        return null
    }
}))

const Secondary = (props) => {
    mockSecondaryProps = props
    return null
}

const deferred = () => {
    let resolve
    const promise = new Promise((done) => { resolve = done })
    return { promise, resolve }
}

const setup = (props) => render(
    <NameDialog visible title='New' onDismiss={jest.fn()} onSubmit={jest.fn()} {...props} />
)

describe('name dialog', () => {
    beforeEach(() => {
        mockName = 'Plan'
        mockConfirmProps = {}
        mockSecondaryProps = {}
        mockCancelProps = {}
    })

    test('submits the trimmed name only once when create is pressed twice', async () => {
        const gate = deferred()
        const onSubmit = jest.fn(() => gate.promise)
        mockName = '  Plan  '
        await setup({ onSubmit })

        let first
        await act(async () => {
            first = mockConfirmProps.onPress()
            mockConfirmProps.onPress()
        })
        gate.resolve()
        await act(async () => { await first })

        expect(onSubmit).toHaveBeenCalledTimes(1)
        expect(onSubmit).toHaveBeenCalledWith('Plan')
    })

    test('shows the loader on create while the submit is running', async () => {
        const gate = deferred()
        await setup({ onSubmit: () => gate.promise })

        let running
        await act(async () => { running = mockConfirmProps.onPress() })
        expect(mockConfirmProps.loading).toBe(true)

        gate.resolve()
        await act(async () => { await running })

        expect(mockConfirmProps.loading).toBe(false)
    })

    test('dismisses the dialog after the submit finished', async () => {
        const onDismiss = jest.fn()
        await setup({ onDismiss })

        await act(async () => { await mockConfirmProps.onPress() })

        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    test('does not submit an empty name', async () => {
        mockName = '   '
        const onSubmit = jest.fn()
        await setup({ onSubmit })

        await act(async () => { await mockConfirmProps.onPress() })

        expect(onSubmit).not.toHaveBeenCalled()
        expect(mockConfirmProps.disabled).toBe(true)
    })

    test('locks the secondary action while creating', async () => {
        const gate = deferred()
        await setup({ onSubmit: () => gate.promise, secondaryAction: <Secondary /> })
        expect(mockSecondaryProps.disabled).toBe(false)

        let running
        await act(async () => { running = mockConfirmProps.onPress() })
        expect(mockSecondaryProps.disabled).toBe(true)

        gate.resolve()
        await act(async () => { await running })
    })

    test('locks create while the secondary action is busy', async () => {
        await setup({ busy: true })

        expect(mockConfirmProps.disabled).toBe(true)
    })

    test('shows a cancel button that dismisses the dialog', async () => {
        const onDismiss = jest.fn()
        await setup({ onDismiss })

        mockCancelProps.onPress()

        expect(onDismiss).toHaveBeenCalledTimes(1)
    })

    test('locks the cancel button while creating', async () => {
        const gate = deferred()
        await setup({ onSubmit: () => gate.promise })
        expect(mockCancelProps.disabled).toBe(false)

        let running
        await act(async () => { running = mockConfirmProps.onPress() })
        expect(mockCancelProps.disabled).toBe(true)

        gate.resolve()
        await act(async () => { await running })
    })

    test('replaces the cancel button with the secondary action', async () => {
        await setup({ secondaryAction: <Secondary /> })

        expect(mockCancelProps).toEqual({})
    })
})
