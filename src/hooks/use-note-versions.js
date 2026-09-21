import { useFileStorage } from './use-file-storage'
import { commitNoteVersion, loadNoteVersions } from '../utils/note-versions'

export function useNoteVersions() {
    const fileStorage = useFileStorage()

    return {
        getVersions: (directoryUri, noteId) => loadNoteVersions(fileStorage, directoryUri, noteId),
        commitVersion: (directoryUri, noteId, title, content) => (
            commitNoteVersion(fileStorage, directoryUri, noteId, title, content)
        )
    }
}
