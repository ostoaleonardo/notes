import { useEffect } from 'react'
import { Redirect, router } from 'expo-router'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { getEditorPath } from '@/utils/editor-path'

import { ROUTES } from '@/constants/routes'

export default function App() {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeRepository } = useRepositories()

    const isReady = !!activeRepository && !loading

    useEffect(() => {
        if (!isReady || !currentId) return

        router.replace(ROUTES.HOME)
        router.push(getEditorPath(currentId))
    }, [isReady])

    if (!isReady) return <Redirect href={ROUTES.REPOSITORY_GATE} />
    if (!currentId) return <Redirect href={ROUTES.HOME} />

    return null
}
