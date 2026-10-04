import { useCallback, useEffect, useRef, useState } from 'react'

import { useTemplates } from './use-templates'
import { subscribeTemplatesChanged } from '@/utils/templates-events'

export function useTemplatesList(deps = [], { immediate = true } = {}) {
    const { listTemplates, listTemplateFolders } = useTemplates()
    const [templates, setTemplates] = useState([])
    const [folders, setFolders] = useState([])
    const mountedRef = useRef(true)

    useEffect(() => () => {
        mountedRef.current = false
    }, [])

    const refresh = useCallback(() => (
        Promise.all([listTemplates(), listTemplateFolders()]).then(([result, folderPaths]) => {
            if (!mountedRef.current) return

            setTemplates(result)
            setFolders(folderPaths)
        })
    ), [listTemplates, listTemplateFolders])

    useEffect(() => subscribeTemplatesChanged(refresh), [refresh])

    useEffect(() => {
        if (immediate) refresh()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, deps)

    return { templates, folders, refresh }
}
