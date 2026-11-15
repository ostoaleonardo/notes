jest.mock('../modules/repository-fs', () => {
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
            findChild: (uri, name) => (
                listDirectorySync(uri).find((entry) => entry.name === name) ?? null
            ),
            hasDirectAccess: () => false,
            requestDirectAccess: () => {},
            revokePermissions: () => {}
        }
    }
})
