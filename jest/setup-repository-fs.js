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
            listDirectory: async (uri) => listDirectorySync(uri),
            readTextFiles,
            hasDirectAccess: () => false,
            requestDirectAccess: () => {}
        }
    }
})
