import { useCallback } from 'react'

import { useBottomSheet } from './use-bottom-sheet'

export function useMarkdownSheets(action) {
    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()
    const { run } = action
    const { onOpen: openLink } = linkSheet
    const { onOpen: openTable } = tableSheet
    const { onOpen: openImage } = imageSheet

    const onRunAction = useCallback((actionName) => {
        if (actionName === 'link') {
            openLink()
            return
        }

        if (actionName === 'table') {
            openTable()
            return
        }

        if (actionName === 'image') {
            openImage()
            return
        }

        run(actionName)
    }, [run, openLink, openTable, openImage])

    return { onRunAction, linkSheet, tableSheet, imageSheet }
}
