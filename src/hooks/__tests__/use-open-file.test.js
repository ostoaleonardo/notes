import { renderHook } from '@testing-library/react-native'
import { router } from 'expo-router'
import * as Sharing from 'expo-sharing'

import { useOpenFile } from '../use-open-file'
import { showSnackbar } from '@/components/snackbar/snackbar-host'
import { FILE_KINDS } from '@/constants/file-types'
import { ROUTES } from '@/constants/routes'

const mockCopy = jest.fn()
const mockDelete = jest.fn()
let mockCacheExists = false

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: (key) => key })
}))
jest.mock('expo-router', () => ({
    router: { push: jest.fn() }
}))
jest.mock('expo-sharing', () => ({
    shareAsync: jest.fn()
}))
jest.mock('@/components/snackbar/snackbar-host', () => ({
    showSnackbar: jest.fn()
}))
jest.mock('expo-file-system', () => ({
    Paths: { cache: 'file:///cache' },
    File: class {
        constructor(...parts) {
            this.uri = parts.join('/')
        }

        get exists() {
            return mockCacheExists
        }

        delete() {
            mockDelete(this.uri)
        }

        copy(target) {
            mockCopy(this.uri, target.uri)
        }
    }
}))

const pdf = {
    kind: FILE_KINDS.PDF,
    uri: 'file:///notes/doc.pdf',
    filename: 'doc.pdf',
    mimeType: 'application/pdf'
}

const setup = async () => {
    const { result } = await renderHook(() => useOpenFile())
    return result.current
}

describe('open file', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockCacheExists = false
    })

    test('shows an error when there is no file', async () => {
        const openFile = await setup()

        await openFile(null)

        expect(showSnackbar).toHaveBeenCalledWith('message.files.open_failed')
    })

    test('opens images in the image viewer with an encoded url', async () => {
        const openFile = await setup()

        await openFile({ kind: FILE_KINDS.IMAGE, uri: 'file:///a b.png' })

        expect(router.push).toHaveBeenCalledWith({
            pathname: ROUTES.IMAGE_VIEWER,
            params: { url: encodeURIComponent('file:///a b.png') }
        })
        expect(Sharing.shareAsync).not.toHaveBeenCalled()
    })

    test('copies other files to the cache and shares the copy', async () => {
        const openFile = await setup()

        await openFile(pdf)

        expect(mockCopy).toHaveBeenCalledWith('file:///notes/doc.pdf', 'file:///cache/doc.pdf')
        expect(Sharing.shareAsync).toHaveBeenCalledWith(
            'file:///cache/doc.pdf',
            { mimeType: 'application/pdf' }
        )
    })

    test('replaces a stale cached copy before copying', async () => {
        mockCacheExists = true
        const openFile = await setup()

        await openFile(pdf)

        expect(mockDelete).toHaveBeenCalledWith('file:///cache/doc.pdf')
    })

    test('shows an error when sharing fails', async () => {
        jest.spyOn(console, 'warn').mockImplementation(() => {})
        Sharing.shareAsync.mockRejectedValueOnce(new Error('no share'))
        const openFile = await setup()

        await openFile(pdf)

        expect(showSnackbar).toHaveBeenCalledWith('message.files.open_failed')
        console.warn.mockRestore()
    })
})
