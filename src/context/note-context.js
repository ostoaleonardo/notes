import { createContext, useEffect, useRef, useState } from 'react'
import { AppState } from 'react-native'
import { useRepositoryData } from '../hooks/use-repository-data'
import { useRepositories } from '../hooks/use-repositories'
import { DEFAULT_TAGS } from '@/constants'

export const NoteContext = createContext()

export function NoteProvider({ children }) {
    const [notes, setNotes] = useState([])
    const [tags, setTags] = useState(DEFAULT_TAGS)
    const [paramId, setParamId] = useState('')
    const [loading, setLoading] = useState(true)

    const loadRepositoryData = useRepositoryData()

    const {
        activeRepository,
        activeRepositoryTree
    } = useRepositories()

    const treeKey = activeRepositoryTree.map((repository) => repository.uri).join('|')
    const previousRepositoryIdRef = useRef(null)

    useEffect(() => {
        if (!activeRepository) return

        const isRepositorySwitch = previousRepositoryIdRef.current !== activeRepository.id
        previousRepositoryIdRef.current = activeRepository.id

        const getNotes = async (showLoading = true) => {
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

        getNotes(isRepositorySwitch)

        const subscription = AppState.addEventListener('change', (state) => {
            if (state === 'active') getNotes(false)
        })

        return () => subscription.remove()
    }, [treeKey])

    const clear = () => {
        setNotes([])
        setTags(DEFAULT_TAGS)
    }

    return (
        <NoteContext.Provider
            value={{
                notes,
                setNotes,
                tags,
                setTags,
                paramId,
                setParamId,
                loading,
                clear
            }}
        >
            {children}
        </NoteContext.Provider>
    )
}
