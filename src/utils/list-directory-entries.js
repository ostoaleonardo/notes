import { Directory } from 'expo-file-system'

import { logError } from './log-error'

import { LOG_MESSAGES } from '@/constants/log-messages'

export const listDirectoryEntries = (uri) => {
    try {
        return new Directory(uri).list().map((entry) => ({
            name: entry.name,
            uri: entry.uri,
            isDirectory: entry instanceof Directory
        }))
    } catch (error) {
        logError(LOG_MESSAGES.ERROR_LISTING_DIRECTORY, error)
        return []
    }
}
