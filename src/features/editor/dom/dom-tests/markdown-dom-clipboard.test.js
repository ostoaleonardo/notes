import { copyText } from '@/features/editor/dom/markdown-dom-clipboard'

import { logError } from '@/shared/utils/log-error'

jest.mock('@/shared/utils/log-error', () => ({ logError: jest.fn() }))

const setClipboard = (clipboard) => {
    Object.defineProperty(navigator, 'clipboard', { value: clipboard, configurable: true })
}

describe('copy text', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('writes the text to the clipboard', async () => {
        const writeText = jest.fn().mockResolvedValue()
        setClipboard({ writeText })

        expect(await copyText('code')).toBe(true)
        expect(writeText).toHaveBeenCalledWith('code')
        expect(logError).not.toHaveBeenCalled()
    })

    test('logs and returns false when the write is rejected', async () => {
        setClipboard({ writeText: jest.fn().mockRejectedValue(new Error('denied')) })

        expect(await copyText('code')).toBe(false)
        expect(logError).toHaveBeenCalledTimes(1)
    })

    test('logs and returns false when the clipboard api is missing', async () => {
        setClipboard(undefined)

        expect(await copyText('code')).toBe(false)
        expect(logError).toHaveBeenCalledTimes(1)
    })
})
