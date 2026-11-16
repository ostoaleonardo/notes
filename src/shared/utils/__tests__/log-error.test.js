import { logError } from '../log-error'

describe('log error', () => {
    test('warns with the message and the error', () => {
        const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
        const error = new Error('boom')

        logError('failed to load', error)

        expect(warn).toHaveBeenCalledWith('failed to load', error)
        warn.mockRestore()
    })
})
