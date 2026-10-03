import { useCallback, useEffect, useRef, useState } from 'react'

import { useTemplates } from './use-templates'

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

    useEffect(() => {
        if (immediate) refresh()
         
    }, deps)

    return { templates, folders, refresh }
}
