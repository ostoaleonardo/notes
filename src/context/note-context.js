import {
    createContext,
    useCallback,
    useEffect,
    useEffectEvent,
    useMemo,
    useRef,
    useState
} from 'react'

import { useOnForeground } from '@/hooks/use-on-foreground'
import { useFileStorage } from '@/hooks/use-file-storage'
import { useRepositoryData } from '@/hooks/use-repository-data'
import { useRepositories } from '@/hooks/use-repositories'
import { useStableMap } from '@/hooks/use-stable-map'
import { useUtils } from '@/hooks/use-utils'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { collectTags } from '@/utils/note-tags'
import { getNotePaths } from '@/utils/note-path'
import { mergeLoadedNotes } from '@/utils/merge-loaded-notes'
import { getIndexingStatus, setIndexingStatus } from '@/utils/indexing-status'

import { INDEXING_COMPLETE, INDEXING_NOTICE_MIN_FILES, INDEXING_STARTED } from '@/constants/indexing'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'
import { LOG_MESSAGES } from '@/constants/log-messages'
import { logError } from '@/utils/log-error'

export const NoteContext = createContext()

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([])
    const [loadedRepositoryId, setLoadedRepositoryId] = useState(null)

    const loadRepositoryData = useRepositoryData()
    const { readRepositoryIndex, writeRepositoryIndex } = useFileStorage()

    const {
        repositories,
        activeRepository,
        activeRepositoryTree
    } = useRepositories()

    const { pinned, updatePinned } = useUtils()
    const { recent, removeRecent } = useRecentNotes()

    const treeKey = activeRepositoryTree.map((repository) => repository.uri).join('|')
    const previousRepositoryIdRef = useRef(null)

    const pruneStaleFavoritesRef = useRef(null)
    pruneStaleFavoritesRef.current = (loadedNotes) => {
        const notePaths = new Set(loadedNotes.map((note) => note.path))
        const isStale = (entry) => !entry.startsWith(TEMPLATE_TAB_PREFIX) && !notePaths.has(entry)

        const stalePinned = [...pinned].filter(isStale)
        if (stalePinned.length > 0) {
            const next = new Set(pinned)
            stalePinned.forEach((entry) => next.delete(entry))
            updatePinned(next)
        }

        recent.filter(isStale).forEach((entry) => removeRecent(entry))
    }

    const loadRunRef = useRef({ id: 0, running: false })

    const getNotesRef = useRef(null)
    getNotesRef.current = async (isRepositorySwitch) => {
        if (!activeRepository) return

        const run = loadRunRef.current
        const id = ++run.id
        const isCurrent = () => run.id === id
        run.running = true

        const rootRepository = activeRepositoryTree[0] || activeRepository
        const reportProgress = (done, total) => {
            if (!isCurrent()) return

            if (getIndexingStatus() || total >= INDEXING_NOTICE_MIN_FILES) {
                setIndexingStatus({ progress: done / total })
            }
        }

        try {
            let snapshot = notes

            if (isRepositorySwitch) {
                setLoadedRepositoryId(null)
                snapshot = await readRepositoryIndex(rootRepository.id)
                if (!isCurrent()) return

                setNotes(snapshot)
                if (snapshot.length) setLoadedRepositoryId(activeRepository.id)
                else setIndexingStatus(INDEXING_STARTED)
            }

            const { notes: loaded, changed } = await loadRepositoryData(
                activeRepositoryTree,
                rootRepository,
                snapshot,
                reportProgress
            )
            if (!isCurrent()) return

            pruneStaleFavoritesRef.current(loaded)
            if (!changed) return

            setNotes((current) => mergeLoadedNotes(loaded, snapshot, current))
            writeRepositoryIndex(rootRepository.id, loaded)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_LOADING_NOTES, error)
            if (isCurrent()) setIndexingStatus(null)
        } finally {
            if (isCurrent()) {
                run.running = false
                setLoadedRepositoryId(activeRepository.id)
                if (getIndexingStatus()) setIndexingStatus(INDEXING_COMPLETE)
            }
        }
    }

    const reloadForTree = useEffectEvent(() => {
        if (!activeRepository) return

        const isRepositorySwitch = previousRepositoryIdRef.current !== activeRepository.id
        previousRepositoryIdRef.current = activeRepository.id

        getNotesRef.current(isRepositorySwitch)
    })

    useEffect(() => {
        reloadForTree()
    }, [treeKey])

    useOnForeground(() => {
        if (!loadRunRef.current.running) getNotesRef.current(false)
    })

    const loading = loadedRepositoryId !== activeRepository?.id

    const clear = useCallback(() => {
        setNotes([])
    }, [])

    const tags = useMemo(() => collectTags(notes), [notes])
    const notesByPath = useMemo(() => new Map(notes.map((note) => [note.path, note])), [notes])

    const notePaths = useStableMap(useMemo(() => getNotePaths(notes, repositories), [notes, repositories]))

    const value = useMemo(() => ({
        notes,
        notesByPath,
        notePaths,
        setNotes,
        tags,
        loading,
        clear
    }), [notes, notesByPath, notePaths, tags, loading, clear])

    return (
        <NoteContext.Provider value={value}>
            {children}
        </NoteContext.Provider>
    )
}
