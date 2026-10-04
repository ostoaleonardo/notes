import { useCallback, useEffect, useRef, useState } from 'react'

import { useMemoByDeps } from './use-memo-by-deps'
import { useTemplates } from './use-templates'
import { subscribeTemplatesChanged } from '@/utils/templates-events'

export function useTemplatesList(deps = [], { immediate = true } = {}) {
    const { listTemplates, listTemplateFolders } = useTemplates()
    const [templates, setTemplates] = useState([])
    const [folders, setFolders] = useState([])
    const mountedRef = useRef(true)
    const depsToken = useMemoByDeps(() => ({}), deps)

    const refreshRef = useRef(null)

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

    refreshRef.current = refresh

    useEffect(() => subscribeTemplatesChanged(refresh), [refresh])

    useEffect(() => {
        if (immediate) refreshRef.current()
    }, [immediate, depsToken])

    return { templates, folders, refresh }
}
