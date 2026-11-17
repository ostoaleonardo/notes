import {
    createContext,
    useCallback,
    useEffect,
    useEffectEvent,
    useMemo,
    useRef,
    useState
} from 'react'

import { useOnForeground } from '@/shared/hooks/use-on-foreground'
import { useFileStorage } from '@/shared/hooks/use-file-storage'
import { useRepositoryData } from '@/shared/hooks/use-repository-data'
import { useRepositories } from '@/shared/hooks/use-repositories'
import { useStableMap } from '@/shared/hooks/use-stable-map'
import { useUtils } from '@/shared/hooks/use-utils'
import { useRecentNotes } from '@/shared/hooks/use-recent-notes'
import { collectTags } from '@/shared/utils/note-tags'
import { getNotePaths } from '@/shared/utils/note-path'
import { mergeLoadedNotes } from '@/shared/utils/merge-loaded-notes'
import { getIndexingStatus, setIndexingStatus } from '@/shared/utils/indexing-status'
import { isBodylessVault } from '@/shared/utils/body-mode'
import { loadNotesFromIndex } from '@/shared/utils/index-notes'
import { syncRepositoryIndex } from '@/shared/utils/repository-index'
import { searchIndex } from '@/shared/utils/search-index'

import { BOOT_MARKS } from '@/shared/constants/boot-marks'
import { INDEXING_COMPLETE, INDEXING_NOTICE_MIN_FILES, INDEXING_STARTED } from '@/shared/constants/indexing'
import { TEMPLATE_TAB_PREFIX } from '@/shared/constants/tabs'
import { LOG_MESSAGES } from '@/shared/constants/log-messages'
import { logError } from '@/shared/utils/log-error'
import { bootMark } from '@/shared/utils/boot-mark'

export const NoteContext = createContext()

export const NoteProvider = ({ children }) => {
    const [notes, setNotes] = useState([])
    const [loadedRepositoryId, setLoadedRepositoryId] = useState(null)
    const [indexSyncRequest, setIndexSyncRequest] = useState(0)

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
    const bodylessRef = useRef(false)

    const indexedSource = useMemo(() => ({
        sync: (tree) => syncRepositoryIndex(tree, repositories),
        list: loadNotesFromIndex
    }), [repositories])

    const readStartSnapshot = async (rootId) => {
        const ids = activeRepositoryTree.map((repository) => repository.id)

        bodylessRef.current = await isBodylessVault(ids)

        if (bodylessRef.current) {
            try {
                return await loadNotesFromIndex(ids)
            } catch (error) {
                logError(LOG_MESSAGES.ERROR_LISTING_INDEXED_NOTES, error)
                bodylessRef.current = false
            }
        }

        return readRepositoryIndex(rootId)
    }

    const getNotesRef = useRef(null)
    getNotesRef.current = async (isRepositorySwitch) => {
        if (!activeRepository) return

        const run = loadRunRef.current
        const id = ++run.id
        const isCurrent = () => run.id === id
        run.running = true
        bootMark(BOOT_MARKS.LOAD_START, { isRepositorySwitch })

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
                snapshot = await readStartSnapshot(rootRepository.id)
                if (!isCurrent()) return

                setNotes(snapshot)
                bootMark(BOOT_MARKS.SNAPSHOT_SET, { notes: snapshot.length })
                if (snapshot.length) setLoadedRepositoryId(activeRepository.id)
                else setIndexingStatus(INDEXING_STARTED)
            }

            const { notes: loaded, changed } = await loadRepositoryData(
                activeRepositoryTree,
                rootRepository,
                snapshot,
                reportProgress,
                bodylessRef.current ? indexedSource : undefined
            )
            if (!isCurrent()) return
            bootMark(BOOT_MARKS.SCAN_DONE, { changed, notes: loaded.length })

            pruneStaleFavoritesRef.current(loaded)
            if (!changed) return

            setNotes((current) => mergeLoadedNotes(loaded, snapshot, current))
            if (!bodylessRef.current) writeRepositoryIndex(rootRepository.id, loaded)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_LOADING_NOTES, error)
            if (isCurrent()) setIndexingStatus(null)
        } finally {
            if (isCurrent()) {
                run.running = false
                setLoadedRepositoryId(activeRepository.id)
                bootMark(BOOT_MARKS.LOAD_END)
                if (getIndexingStatus()) setIndexingStatus(INDEXING_COMPLETE)
                setIndexSyncRequest((request) => request + 1)
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

    const syncIndex = useEffectEvent(async () => {
        const startNotes = notes

        await syncRepositoryIndex(activeRepositoryTree, repositories)

        try {
            await searchIndex.refresh(startNotes)
        } catch (error) {
            logError(LOG_MESSAGES.ERROR_REFRESHING_SEARCH_INDEX, error)
        }
    })

    useEffect(() => {
        if (indexSyncRequest > 0) syncIndex()
    }, [indexSyncRequest])

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
