import { renderHook } from '@testing-library/react-native'

import { useSpecialFolders } from '../use-special-folders'
import { makeProps, root, child } from '../__fixtures__/repository-props'
import { ATTACHMENT_LOCATIONS } from '@/shared/constants/attachments'

const setup = async (overrides) => {
    const props = makeProps(overrides)
    const { result } = await renderHook(() => useSpecialFolders(props))
    return { props, api: result.current }
}

describe('special folders', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    describe('ensure templates folder', () => {
        test('returns the existing folder without persisting when already linked', async () => {
            const linked = { ...root, templatesUri: 'file:///root/templates' }
            const { props, api } = await setup({ folders: [linked, child] })
            props.fileStorage.findDirectory.mockReturnValue({ uri: 'file:///root/templates' })

            const uri = await api.ensureTemplatesFolder(child)

            expect(uri).toBe('file:///root/templates')
            expect(props.persistFolders).not.toHaveBeenCalled()
        })

        test('links an existing folder that is not yet tracked', async () => {
            const { props, api } = await setup()
            props.fileStorage.findDirectory.mockReturnValue({ uri: 'file:///root/templates' })

            await api.ensureTemplatesFolder(root)

            const persisted = props.persistFolders.mock.calls[0][0]
            expect(persisted.find((r) => r.id === 'root').templatesUri)
                .toBe('file:///root/templates')
        })

        test('creates and seeds the folder when it is missing', async () => {
            const { props, api } = await setup()

            const uri = await api.ensureTemplatesFolder(child)

            expect(uri).toBe('file:///root/templates')
            expect(props.seedTemplates).toHaveBeenCalledWith('file:///root/templates')
            expect(props.busyRef.current).toBe(false)
        })
    })

    describe('ensure media folders', () => {
        test('returns the images folder of the root repository', async () => {
            const { api } = await setup()

            expect(api.ensureImagesFolder(child)).toBe('file:///root/images')
        })

        test('returns the parent uri when the location has no folder name', async () => {
            const { api } = await setup()

            const uri = api.ensureAttachmentsFolder(child, {
                location: ATTACHMENT_LOCATIONS.REPOSITORY,
                folderName: 'files'
            })

            expect(uri).toBe('file:///root')
        })

        test('reuses an existing attachments folder', async () => {
            const { props, api } = await setup()
            props.fileStorage.findDirectory.mockReturnValue({ uri: 'file:///root/files' })

            const uri = api.ensureAttachmentsFolder(child, {
                location: ATTACHMENT_LOCATIONS.FOLDER,
                folderName: 'files'
            })

            expect(uri).toBe('file:///root/files')
            expect(props.fileStorage.createSubdirectory).not.toHaveBeenCalled()
        })

        test('creates the attachments folder when it does not exist', async () => {
            const { props, api } = await setup()

            const uri = api.ensureAttachmentsFolder(child, {
                location: ATTACHMENT_LOCATIONS.SUBFOLDER,
                folderName: 'files'
            })

            expect(uri).toBe('file:///child/files')
            expect(props.fileStorage.createSubdirectory)
                .toHaveBeenCalledWith('file:///child', 'files')
        })
    })
})
