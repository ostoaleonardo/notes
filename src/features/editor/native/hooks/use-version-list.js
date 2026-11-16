import { useEffect, useEffectEvent, useMemo, useState } from 'react'

import { useNoteVersions } from '@/shared/hooks/use-note-versions'
import { usePro } from '@/shared/hooks/use-pro'

import { FREE_VERSION_HISTORY_LIMIT } from '@/shared/constants/default-values'

export function useVersionList({ location, noteId }) {
    const { pro } = usePro()
    const { getVersions } = useNoteVersions()

    const [versions, setVersions] = useState([])
    const [loading, setLoading] = useState(true)

    const loadVersions = useEffectEvent(() => {
        if (!location || !noteId) {
            setVersions([])
            setLoading(false)
            return
        }

        setLoading(true)
        getVersions(location, noteId, pro ? Infinity : FREE_VERSION_HISTORY_LIMIT).then((result) => {
            setVersions(result)
            setLoading(false)
        })
    })

    useEffect(() => {
        loadVersions()
    }, [location?.folderUri, location?.folderPath, noteId, pro])

    const ordered = useMemo(() => [...versions].reverse(), [versions])

    return { versions: ordered, loading }
}
