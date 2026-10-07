import { renderHook } from '@testing-library/react-native'
import { Directory } from 'expo-file-system'

import { useRepositoryCrud } from '../use-repository-crud'
import { REPOSITORY_RESULTS } from '@/constants/repository-results'
import { PICKER_ERROR_CODES } from '@/constants/picker-errors'
import { ATTACHMENT_LOCATIONS } from '@/constants/attachments'

jest.mock('expo-file-system', () => ({
    Directory: { pickDirectoryAsync: jest.fn() }
}))

const repo = (id, parentId = null, extra = {}) => ({
    id,
    uri: `file:///${id}`,
    alias: id,
    parentId,
    ...extra
})

const root = repo('root')
const child = repo('child', 'root')
const grand = repo('grand', 'child')
const other = repo('other')

const makeProps = (overrides = {}) => {
    const repositories = overrides.repositories || [root, child, grand, other]
    const getRootRepository = jest.fn((repository) => (
        repository.parentId
            ? repositories.find((candidate) => candidate.id === 'root')
            : repository
    ))

    return {
        repositories,
        activeRepository: null,
        activeRepositoryId: '',
        pro: false,
        busyRef: { current: false },
        fileStorage: {
            createSubdirectory: jest.fn((uri, name) => ({ uri: `${uri}/${name}`, name })),
            deleteDirectory: jest.fn(),
            renameDirectory: jest.fn(async (uri, parentUri, name) => `${parentUri}/${name}`),
            findDirectory: jest.fn(() => null),
            getOrCreateTemplatesFolder: jest.fn((uri) => ({ uri: `${uri}/templates` })),
            getOrCreateImagesFolder: jest.fn((uri) => ({ uri: `${uri}/images` })),
            renameVersionsUnder: jest.fn(async () => {}),
            deleteVersionsUnder: jest.fn()
        },
        seedWelcomeNote: jest.fn(async () => null),
        setPendingWelcomeNoteId: jest.fn(),
        persistRepositories: jest.fn(async () => {}),
        persistActiveRepository: jest.fn(async () => {}),
        getRootRepository,
        getDescendants: jest.fn((id) => ({
            root: [{ id: 'child' }, { id: 'grand' }],
            child: [{ id: 'grand' }]
        })[id] || []),
        isAncestorOf: jest.fn(() => false),
        seedTemplates: jest.fn(),
        buildRepository: jest.fn((directory, parentId) => ({
            id: 'built',
            uri: directory.uri,
            alias: directory.name,
            parentId
        })),
        discoverSubfolders: jest.fn(() => []),
        relinkUris: jest.fn(() => []),
        ...overrides
    }
}

const setup = async (overrides) => {
    const props = makeProps(overrides)
    const { result } = await renderHook(() => useRepositoryCrud(props))
    return { props, api: result.current }
}

const persistedIds = (props) => (
    props.persistRepositories.mock.calls[0][0].map((repository) => repository.id)
)

describe('repository crud', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        jest.spyOn(console, 'warn').mockImplementation(() => {})
    })

    afterEach(() => {
        console.warn.mockRestore()
    })

    describe('add repository', () => {
        const picked = { uri: 'file:///picked', name: 'picked' }

        test('persists the repository with its discovered subfolders', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ repositories: [] })
            props.discoverSubfolders.mockReturnValue([{ id: 'sub' }])

            const result = await api.addRepository()

            expect(persistedIds(props)).toEqual(['built', 'sub'])
            expect(result.id).toBe('built')
        })

        test('activates the repository when none is active', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ repositories: [] })

            await api.addRepository()

            expect(props.persistActiveRepository).toHaveBeenCalledWith('built')
        })

        test('keeps the current active repository', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ activeRepositoryId: 'root' })

            await api.addRepository()

            expect(props.persistActiveRepository).not.toHaveBeenCalled()
        })

        test('returns duplicate when the folder is already tracked', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue({ uri: root.uri, name: 'root' })
            const { props, api } = await setup()

            const result = await api.addRepository()

            expect(result).toBe(REPOSITORY_RESULTS.DUPLICATE)
            expect(props.persistRepositories).not.toHaveBeenCalled()
        })

        test('returns null when the picker is cancelled', async () => {
            Directory.pickDirectoryAsync.mockRejectedValue({ code: PICKER_ERROR_CODES.CANCELLED })
            const { api } = await setup()

            expect(await api.addRepository()).toBeNull()
        })

        test('returns error when picking fails', async () => {
            Directory.pickDirectoryAsync.mockRejectedValue(new Error('boom'))
            const { api } = await setup()

            expect(await api.addRepository()).toBe(REPOSITORY_RESULTS.ERROR)
        })

        test('marks the welcome note as pending when one is seeded', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ repositories: [] })
            props.seedWelcomeNote.mockResolvedValue('built::Welcome.md')

            const result = await api.addRepository()

            expect(props.setPendingWelcomeNoteId).toHaveBeenCalledWith('built::Welcome.md')
            expect(result.welcomeNotePath).toBe('built::Welcome.md')
        })

        test('releases the busy flag when it finishes', async () => {
            Directory.pickDirectoryAsync.mockResolvedValue(picked)
            const { props, api } = await setup({ repositories: [] })

            await api.addRepository()

            expect(props.busyRef.current).toBe(false)
        })
    })

    describe('pending welcome note', () => {
        test('clears the pending welcome note id', async () => {
            const { props, api } = await setup()

            api.clearPendingWelcomeNote()

            expect(props.setPendingWelcomeNoteId).toHaveBeenCalledWith(null)
        })
    })

    describe('add subfolder', () => {
        test('creates a sanitized subfolder under the parent', async () => {
            const { props, api } = await setup({ pro: true })

            const result = await api.addSubfolder('root', 'a/b')

            expect(props.fileStorage.createSubdirectory)
                .toHaveBeenCalledWith('file:///root', 'a b')
            expect(result.parentId).toBe('root')
            expect(persistedIds(props)).toContain('built')
        })

        test('requires pro past the free subfolder limit', async () => {
            const { props, api } = await setup()

            const result = await api.addSubfolder('root', 'Second')

            expect(result).toBe(REPOSITORY_RESULTS.PRO_REQUIRED)
            expect(props.fileStorage.createSubdirectory).not.toHaveBeenCalled()
        })

        test('allows a free subfolder when the parent has none', async () => {
            const { api } = await setup({ repositories: [root] })

            const result = await api.addSubfolder('root', 'First')

            expect(result.parentId).toBe('root')
        })

        test('requires pro for nested subfolders', async () => {
            const { api } = await setup()

            expect(await api.addSubfolder('child', 'Nested')).toBe(REPOSITORY_RESULTS.PRO_REQUIRED)
        })

        test('returns null when the parent does not exist for pro users', async () => {
            const { api } = await setup({ pro: true })

            expect(await api.addSubfolder('missing', 'Name')).toBeNull()
        })
    })

    describe('ensure templates folder', () => {
        test('returns the existing folder without persisting when already linked', async () => {
            const linked = { ...root, templatesUri: 'file:///root/templates' }
            const { props, api } = await setup({ repositories: [linked, child] })
            props.fileStorage.findDirectory.mockReturnValue({ uri: 'file:///root/templates' })

            const uri = await api.ensureTemplatesFolder(child)

            expect(uri).toBe('file:///root/templates')
            expect(props.persistRepositories).not.toHaveBeenCalled()
        })

        test('links an existing folder that is not yet tracked', async () => {
            const { props, api } = await setup()
            props.fileStorage.findDirectory.mockReturnValue({ uri: 'file:///root/templates' })

            await api.ensureTemplatesFolder(root)

            const persisted = props.persistRepositories.mock.calls[0][0]
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
                location: ATTACHMENT_LOCATIONS.VAULT,
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

    describe('rename repository', () => {
        test('returns null for an unknown repository', async () => {
            const { api } = await setup()

            expect(await api.renameRepository('missing', 'Name')).toBeNull()
        })

        test('only changes the alias of a root repository', async () => {
            const { props, api } = await setup()

            await api.renameRepository('root', 'Renamed')

            const persisted = props.persistRepositories.mock.calls[0][0]
            expect(persisted.find((r) => r.id === 'root').alias).toBe('Renamed')
            expect(props.fileStorage.renameDirectory).not.toHaveBeenCalled()
        })

        test('renames the folder and relinks descendants for a subfolder', async () => {
            const { props, api } = await setup()
            props.relinkUris.mockReturnValue([{ ...grand, uri: 'file:///root/New/grand' }])

            const result = await api.renameRepository('child', 'New')

            expect(props.fileStorage.renameDirectory)
                .toHaveBeenCalledWith('file:///child', 'file:///root', 'New')
            expect(props.fileStorage.renameVersionsUnder)
                .toHaveBeenCalledWith('file:///root', 'child', 'New')
            expect(result).toMatchObject({ alias: 'New', uri: 'file:///root/New' })
            const persisted = props.persistRepositories.mock.calls[0][0]
            expect(persisted.find((r) => r.id === 'grand').uri).toBe('file:///root/New/grand')
        })

        test('returns error when the folder rename fails', async () => {
            const { props, api } = await setup()
            props.fileStorage.renameDirectory.mockRejectedValue(new Error('exists'))

            const result = await api.renameRepository('child', 'New')

            expect(result).toBe(REPOSITORY_RESULTS.ERROR)
            expect(props.persistRepositories).not.toHaveBeenCalled()
            expect(props.busyRef.current).toBe(false)
        })

        test('returns error when the parent repository is missing', async () => {
            const { api } = await setup({ repositories: [child] })

            expect(await api.renameRepository('child', 'New')).toBe(REPOSITORY_RESULTS.ERROR)
        })
    })

    describe('forget repository', () => {
        test('removes the repository and its descendants from the list only', async () => {
            const { props, api } = await setup()

            await api.forgetRepository('root')

            expect(persistedIds(props)).toEqual(['other'])
            expect(props.fileStorage.deleteDirectory).not.toHaveBeenCalled()
        })

        test('moves the active repository to the first remaining one', async () => {
            const { props, api } = await setup({ activeRepositoryId: 'root' })

            await api.forgetRepository('root')

            expect(props.persistActiveRepository).toHaveBeenCalledWith('other')
        })

        test('ignores an unknown repository', async () => {
            const { props, api } = await setup()

            await api.forgetRepository('missing')

            expect(props.persistRepositories).not.toHaveBeenCalled()
        })
    })

    describe('remove repository', () => {
        test('refuses to remove an ancestor of the active repository', async () => {
            const { props, api } = await setup({
                activeRepository: grand,
                isAncestorOf: jest.fn(() => true)
            })

            const result = await api.removeRepository('root')

            expect(result).toBe(REPOSITORY_RESULTS.ACTIVE)
            expect(props.fileStorage.deleteDirectory).not.toHaveBeenCalled()
        })

        test('deletes a root repository folder without touching versions', async () => {
            const { props, api } = await setup()

            const result = await api.removeRepository('other')

            expect(props.fileStorage.deleteDirectory).toHaveBeenCalledWith('file:///other')
            expect(props.fileStorage.deleteVersionsUnder).not.toHaveBeenCalled()
            expect(result.id).toBe('other')
        })

        test('deletes a subfolder together with its versions', async () => {
            const { props, api } = await setup()

            await api.removeRepository('child')

            expect(persistedIds(props)).toEqual(['root', 'other'])
            expect(props.fileStorage.deleteVersionsUnder)
                .toHaveBeenCalledWith('file:///root', 'child')
        })

        test('returns null for an unknown repository', async () => {
            const { api } = await setup()

            expect(await api.removeRepository('missing')).toBeNull()
        })
    })

    describe('set active repository', () => {
        test('persists the chosen repository id', async () => {
            const { props, api } = await setup()

            api.setActiveRepository('other')

            expect(props.persistActiveRepository).toHaveBeenCalledWith('other')
        })
    })
})
