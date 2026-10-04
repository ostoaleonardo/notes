import { Directory } from 'expo-file-system'

import { logError } from './log-error'

export const listDirectoryEntries = (uri) => {
    try {
        return new Directory(uri).list().map((entry) => ({
            name: entry.name,
            uri: entry.uri,
            isDirectory: entry instanceof Directory
        }))
    } catch (error) {
        logError('error listing directory', error)
        return []
    }
}
