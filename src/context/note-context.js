import { createContext, useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { useOnForeground } from '../hooks/use-on-foreground'
import { useRepositoryData } from '../hooks/use-repository-data'
import { useRepositories } from '../hooks/use-repositories'

import { DEFAULT_TAGS } from '@/constants/default-values'

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

    const treeKey = activeRepositoryTree.map((repository) => repository.uri).join('|')
    const previousRepositoryIdRef = useRef(null)

    const getNotesRef = useRef(null)
    getNotesRef.current = async (showLoading = true) => {
        if (!activeRepository) return

        if (showLoading) setLoading(true)

        try {
            const rootRepository = activeRepositoryTree[0] || activeRepository
            const { notes, tags } = await loadRepositoryData(activeRepositoryTree, rootRepository)

            setNotes(notes)
            setTags(tags)
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

    const value = useMemo(() => ({
        notes,
        setNotes,
        tags,
        setTags,
        loading,
        clear
    }), [notes, tags, loading, clear])

    return (
        <NoteContext.Provider value={value}>
            {children}
        </NoteContext.Provider>
    )
}
