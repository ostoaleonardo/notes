const repo = (id, parentId = null, extra = {}) => ({
    id,
    uri: `file:///${id}`,
    alias: id,
    parentId,
    ...extra
})

export const root = repo('root')
export const child = repo('child', 'root')
export const grand = repo('grand', 'child')
const other = repo('other')

export const makeProps = (overrides = {}) => {
    const folders = overrides.folders || [root, child, grand, other]
    const getRootRepository = jest.fn((folder) => (
        folder.parentId
            ? folders.find((candidate) => candidate.id === 'root')
            : folder
    ))

    return {
        folders,
        activeFolder: null,
        activeFolderId: '',
        pro: false,
        busyRef: { current: false },
        fileStorage: {
            createSubdirectory: jest.fn((uri, name) => ({ uri: `${uri}/${name}`, name })),
            deleteDirectory: jest.fn(),
            renameFolder: jest.fn(async ({ parentUri, newName }) => ({
                path: newName,
                uri: `${parentUri}/${newName}`
            })),
            removeFolder: jest.fn(async () => {}),
            findDirectory: jest.fn(() => null),
            getOrCreateTemplatesFolder: jest.fn((uri) => ({ uri: `${uri}/templates` })),
            getOrCreateImagesFolder: jest.fn((uri) => ({ uri: `${uri}/images` })),
            deleteFolderIndex: jest.fn()
        },
        seedWelcomeNote: jest.fn(async () => null),
        setPendingWelcomeNoteId: jest.fn(),
        persistFolders: jest.fn(async () => {}),
        persistActiveFolder: jest.fn(async () => {}),
        getRootRepository,
        getDescendants: jest.fn((id) => ({
            root: [{ id: 'child' }, { id: 'grand' }],
            child: [{ id: 'grand' }]
        })[id] || []),
        isAncestorOf: jest.fn(() => false),
        seedTemplates: jest.fn(),
        buildFolder: jest.fn((directory, parentId) => ({
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

export const persistedIds = (props) => (
    props.persistFolders.mock.calls[0][0].map((folder) => folder.id)
)
