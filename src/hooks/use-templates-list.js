import { useCallback, useEffect, useRef, useState } from 'react'

import { useTemplates } from './use-templates'

export function useTemplatesList(deps = [], { immediate = true } = {}) {
    const { listTemplates } = useTemplates()
    const [templates, setTemplates] = useState([])
    const mountedRef = useRef(true)

    useEffect(() => () => {
        mountedRef.current = false
    }, [])

    const refresh = useCallback(() => (
        listTemplates().then((result) => {
            if (mountedRef.current) setTemplates(result)
        })
    ), [listTemplates])

    useEffect(() => {
        if (immediate) refresh()
         
    }, deps)

    return { templates, refresh }
}
