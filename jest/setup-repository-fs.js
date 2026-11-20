jest.mock('repository-fs', () => {
    const listDirectorySync = (uri) => {
        const { Directory } = require('expo-file-system')

        return new Directory(uri).list().map((entry) => ({
            uri: entry.uri,
            name: entry.name,
            isDirectory: entry instanceof Directory,
            lastModified: entry.lastModified ?? null
        }))
    }

    const readTextFiles = (uris) => {
        const { File } = require('expo-file-system')
        return Promise.all(uris.map((uri) => new File(uri).text()))
    }

    return {
        __esModule: true,
        default: {
            listDirectorySync,
            listDirectory: async (uri) => {
                const entries = listDirectorySync(uri)

                return {
                    uris: entries.map((entry) => entry.uri),
                    names: entries.map((entry) => entry.name),
                    directories: entries.map((entry) => entry.isDirectory),
                    lastModified: entries.map((entry) => entry.lastModified),
                    sizes: entries.map((entry) => entry.size ?? null)
                }
            },
            readTextFiles,
            versionsRead: jest.fn(async () => null),
            versionsWrite: jest.fn(async () => {}),
            versionsDelete: jest.fn(async () => {}),
            versionsCommit: jest.fn(async () => true),
            versionsRename: jest.fn(async () => {}),
            versionsRenameUnder: jest.fn(async () => {}),
            versionsDeleteUnder: jest.fn(async () => {}),
            versionsMigrateLegacy: jest.fn(async () => {}),
            composeNote: (tags, propertiesJson, invalidFrontmatter, rawFrontmatter, body) => {
                const { buildNoteFileContent } = require('@/shared/utils/frontmatter')

                return buildNoteFileContent({
                    tags,
                    properties: JSON.parse(propertiesJson),
                    invalidFrontmatter,
                    rawFrontmatter
                }, body)
            },
            decomposeNote: (content) => {
                const { decomposeNoteFileContent } = require('@/shared/utils/frontmatter')
                const parts = decomposeNoteFileContent(content)

                return {
                    ...parts,
                    propertiesJson: parts.properties == null ? null : JSON.stringify(parts.properties)
                }
            },
            indexRepository: async () => ({}),
            pruneRepositoryIndex: async () => {},
            deleteRepositoryIndex: async () => {},
            listAttachments: async (uri) => {
                const { Directory, File } = require('expo-file-system')
                const found = []

                const walk = (directoryUri, folder) => {
                    new Directory(directoryUri).list().forEach((entry) => {
                        if (entry.name.startsWith('.')) return
                        if (entry instanceof Directory) {
                            walk(entry.uri, folder ? `${folder}/${entry.name}` : entry.name)
                        } else if (entry instanceof File && !entry.name.toLowerCase().endsWith('.md')) {
                            found.push({ uri: entry.uri, name: entry.name, folder })
                        }
                    })
                }

                walk(uri, '')

                return {
                    uris: found.map((file) => file.uri),
                    names: found.map((file) => file.name),
                    folders: found.map((file) => file.folder)
                }
            },
            findChild: (uri, name) => (
                listDirectorySync(uri).find((entry) => entry.name === name) ?? null
            ),
            hasDirectAccess: () => false,
            requestDirectAccess: () => {},
            revokePermissions: () => {}
        }
    }
})
