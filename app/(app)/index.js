import { useEffect, useState } from 'react'
import { Redirect, router } from 'expo-router'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useStorage } from '@/hooks/use-storage'
import { getStartupTarget } from '@/utils/startup-target'

import { ROUTES } from '@/constants/routes'
import { STORAGE_KEYS } from '@/constants/storage-keys'
import { STARTUP_BEHAVIORS } from '@/constants/startup-behavior'

export default function App() {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeRepository } = useRepositories()
    const { getItem } = useStorage()

    const [startupBehavior, setStartupBehavior] = useState(null)

    useEffect(() => {
        let cancelled = false

        getItem(STORAGE_KEYS.STARTUP_BEHAVIOR).then((value) => {
            if (!cancelled) setStartupBehavior(value || STARTUP_BEHAVIORS.LAST_OPENED)
        })

        return () => { cancelled = true }
    }, [])

    const isReady = !!activeRepository && !loading && !!startupBehavior

    useEffect(() => {
        if (!isReady) return

        const targetPath = getStartupTarget(startupBehavior, currentId)
        if (!targetPath) return

        router.replace(ROUTES.HOME)
        router.push(targetPath)
    }, [isReady, startupBehavior, currentId])

    if (!isReady) return <Redirect href={ROUTES.REPOSITORY_GATE} />
    return <Redirect href={ROUTES.HOME} />
}
