import { useEffect, useRef, useState } from 'react'

import { useLatestRef } from '../../shared/use-latest-ref'
import { createReadCache, resolveReadContext } from '../read-resolution'

const EMPTY_CONTEXT = { details: new Map(), media: new Map(), local: new Map(), embeds: new Map() }

export const useReadContext = (parsed, services, linkVersion) => {
    const [state, setState] = useState({ parsed: null, context: EMPTY_CONTEXT })
    const cacheRef = useRef({ version: linkVersion, ...createReadCache() })
    const servicesRef = useLatestRef(services)
    const needsResolution = !!parsed && (parsed.targets.length > 0 || parsed.localUrls.length > 0)

    useEffect(() => {
        if (!needsResolution) return undefined

        const cache = cacheRef.current
        if (cache.version !== linkVersion) {
            Object.assign(cache, { version: linkVersion, ...createReadCache() })
        }

        let cancelled = false

        resolveReadContext(parsed, servicesRef.current, cache).then((context) => {
            if (!cancelled) setState({ parsed, context })
        })

        return () => {
            cancelled = true
        }
    }, [parsed, needsResolution, linkVersion, servicesRef])

    if (!parsed) return null
    if (!needsResolution) return EMPTY_CONTEXT

    return state.parsed === parsed ? state.context : null
}
