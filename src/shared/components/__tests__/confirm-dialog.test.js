import { act, render } from '@testing-library/react-native'

import { ConfirmDialog } from '../confirm-dialog'

let mockConfirmProps = {}
let mockDismissProps = {}

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('@/ui/dialog', () => ({
    Dialog: ({ confirm, dismiss, children }) => <>{confirm}{dismiss}{children}</>
}))
jest.mock('@/ui/dialog-text', () => ({
    DialogText: () => null
}))
jest.mock('@/ui/button/filled-button', () => ({
    FilledButton: (props) => {
        mockConfirmProps = props
        return null
    }
}))
jest.mock('@/ui/button/text-button', () => ({
    TextButton: (props) => {
        mockDismissProps = props
        return null
    }
}))

const deferred = () => {
    let resolve
    const promise = new Promise((done) => { resolve = done })
    return { promise, resolve }
}

const setup = (props) => render(
    <ConfirmDialog
        visible
        title='Delete'
        message='Sure?'
        confirmLabel='Delete'
        onDismiss={jest.fn()}
        onConfirm={jest.fn()}
        {...props}
    />
)

describe('confirm dialog', () => {
    test('runs the confirm action only once when pressed twice', async () => {
        const gate = deferred()
        const onConfirm = jest.fn(() => gate.promise)
        await setup({ onConfirm })

        let first
        await act(async () => {
            first = mockConfirmProps.onPress()
            mockConfirmProps.onPress()
        })
        gate.resolve()
        await act(async () => { await first })

        expect(onConfirm).toHaveBeenCalledTimes(1)
    })

    test('keeps the dialog open with a loader until the action finishes', async () => {
        const gate = deferred()
        const onDismiss = jest.fn()
        await setup({ onDismiss, onConfirm: () => gate.promise })

        let running
        await act(async () => { running = mockConfirmProps.onPress() })
        expect(mockConfirmProps.loading).toBe(true)
        expect(onDismiss).not.toHaveBeenCalled()

        gate.resolve()
        await act(async () => { await running })

        expect(onDismiss).toHaveBeenCalledTimes(1)
        expect(mockConfirmProps.loading).toBe(false)
    })

    test('dismisses without confirming when cancel is pressed', async () => {
        const onDismiss = jest.fn()
        const onConfirm = jest.fn()
        await setup({ onDismiss, onConfirm })

        mockDismissProps.onPress()

        expect(onDismiss).toHaveBeenCalledTimes(1)
        expect(onConfirm).not.toHaveBeenCalled()
    })
})
