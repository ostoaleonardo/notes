import { useEffect, useRef, useState } from 'react'

import { useLatestRef } from './use-latest-ref'

const EMPTY_DETAILS = new Map()

export const useWikiLinkDetails = (targets, resolveDetails, linkVersion) => {
    const [details, setDetails] = useState(EMPTY_DETAILS)
    const cacheRef = useRef({ version: linkVersion, details: new Map() })
    const resolveRef = useLatestRef(resolveDetails)

    useEffect(() => {
        if (!targets.length) return undefined

        const cache = cacheRef.current
        if (cache.version !== linkVersion) {
            cache.version = linkVersion
            cache.details.clear()
        }

        const unknown = targets.filter((target) => !cache.details.has(target))

        if (!unknown.length) {
            setDetails(new Map(cache.details))
            return undefined
        }

        let cancelled = false

        resolveRef.current(unknown).then((resolved) => {
            if (cancelled) return

            unknown.forEach((target) => cache.details.set(target, resolved[target]))
            setDetails(new Map(cache.details))
        })

        return () => {
            cancelled = true
        }
    }, [targets, linkVersion, resolveRef])

    if (!targets.length) return EMPTY_DETAILS

    return targets.every((target) => details.has(target)) ? details : null
}
