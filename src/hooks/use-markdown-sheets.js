import { useCallback } from 'react'

import { useBottomSheet } from './use-bottom-sheet'

export function useMarkdownSheets(action) {
    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()

    const onRunAction = useCallback((actionName) => {
        if (actionName === 'link') {
            linkSheet.onOpen()
            return
        }

        if (actionName === 'table') {
            tableSheet.onOpen()
            return
        }

        if (actionName === 'image') {
            imageSheet.onOpen()
            return
        }

        action.run(actionName)
    }, [
        linkSheet.onOpen,
        tableSheet.onOpen,
        imageSheet.onOpen
    ])

    return { onRunAction, linkSheet, tableSheet, imageSheet }
}
