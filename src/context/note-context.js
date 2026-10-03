import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useOnForeground } from '../hooks/use-on-foreground'
import { useRepositoryData } from '../hooks/use-repository-data'
import { useRepositories } from '../hooks/use-repositories'
import { useUtils } from '../hooks/use-utils'
import { useRecentNotes } from '../hooks/use-recent-notes'

import { DEFAULT_TAGS } from '@/constants/default-values'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [tags, setTags] = useState(DEFAULT_TAGS)
    const [loading, setLoading] = useState(true)

    const loadRepositoryData = useRepositoryData()

    const {
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

    const getNotesRef = useRef(null)
    getNotesRef.current = async (showLoading = true) => {
        if (!activeRepository) return

        if (showLoading) setLoading(true)

        try {
            const rootRepository = activeRepositoryTree[0] || activeRepository
            const { notes, tags } = await loadRepositoryData(activeRepositoryTree, rootRepository)

            setNotes(notes)
            setTags(tags)
            pruneStaleFavoritesRef.current(notes)
        } catch (error) {
            console.debug('error loading notes', error)
        } finally {
            if (showLoading) setLoading(false)
        }
    }

    useEffect(() => {
        if (!activeRepository) return

        const isRepositorySwitch = previousRepositoryIdRef.current !== activeRepository.id
        previousRepositoryIdRef.current = activeRepository.id

        getNotesRef.current(isRepositorySwitch)
    }, [treeKey])

    useOnForeground(() => getNotesRef.current(false))

    const clear = useCallback(() => {
        setNotes([])
        setTags(DEFAULT_TAGS)
    }, [])

    const notesByPath = useMemo(() => new Map(notes.map((note) => [note.path, note])), [notes])

    const value = useMemo(() => ({
        notes,
        notesByPath,
        setNotes,
        tags,
        setTags,
        loading,
        clear
    }), [notes, notesByPath, tags, loading, clear])

    return (
        <NoteContext.Provider value={value}>
            {children}
        </NoteContext.Provider>
    )
}
