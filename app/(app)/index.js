import { useEffect, useState } from 'react'
import { Redirect, router } from 'expo-router'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useNotes } from '@/shared/hooks/use-notes'
import { useFolders } from '@/shared/hooks/use-folders'
import { useStorage } from '@/shared/hooks/use-storage'
import { getStartupTarget } from '@/shared/utils/startup-target'
import { pushOnce } from '@/shared/utils/navigation'

import { ROUTES } from '@/shared/constants/routes'
import { STORAGE_KEYS } from '@/shared/constants/storage-keys'
import { STARTUP_BEHAVIORS } from '@/shared/constants/startup-behavior'

export default function App() {
    const { loading } = useNotes()
    const { currentId } = useCurrentNote()
    const { activeFolder } = useFolders()
    const { getItem } = useStorage()

    const [startupBehavior, setStartupBehavior] = useState(null)

    useEffect(() => {
        let cancelled = false

        getItem(STORAGE_KEYS.STARTUP_BEHAVIOR).then((value) => {
            if (!cancelled) setStartupBehavior(value || STARTUP_BEHAVIORS.LAST_OPENED)
        })

        return () => { cancelled = true }
    }, [getItem])

    const isReady = !!activeFolder && !loading && !!startupBehavior

    useEffect(() => {
        if (!isReady) return

        const targetPath = getStartupTarget(startupBehavior, currentId)
        if (!targetPath) return

        router.replace(ROUTES.HOME)
        pushOnce(targetPath)
    }, [isReady, startupBehavior, currentId])

    if (!isReady) return <Redirect href={ROUTES.REPOSITORY_GATE} />
    return <Redirect href={ROUTES.HOME} />
}
