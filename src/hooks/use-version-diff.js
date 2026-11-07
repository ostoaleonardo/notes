import { useEffect, useState } from 'react'

import { diffLines } from '@/utils/diff-lines'

export function useVersionDiff(selected, currentContentRef) {
    const [diff, setDiff] = useState(null)

    useEffect(() => {
        setDiff(null)
        if (!selected) return undefined

        const task = requestIdleCallback(() => {
            setDiff(diffLines(selected.content, currentContentRef.current.content))
        })

        return () => cancelIdleCallback(task)
    }, [selected, currentContentRef])

    return diff
}
