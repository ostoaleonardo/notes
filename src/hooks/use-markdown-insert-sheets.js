import { useCallback } from 'react'

import { useBottomSheet } from './use-bottom-sheet'

export function useMarkdownInsertSheets(markdownAction) {
    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()

    const onRunAction = useCallback((action) => {
        if (action === 'link') {
            linkSheet.onOpen()
            return
        }

        if (action === 'table') {
            tableSheet.onOpen()
            return
        }

        if (action === 'image') {
            imageSheet.onOpen()
            return
        }

        markdownAction.run(action)
    }, [
        linkSheet.onOpen,
        tableSheet.onOpen,
        imageSheet.onOpen
    ])

    return { onRunAction, linkSheet, tableSheet, imageSheet }
}
