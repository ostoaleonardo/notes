import { useCallback } from 'react'

import { useBottomSheet } from './use-bottom-sheet'

import { MARKDOWN_ACTIONS } from '@/constants/markdown-actions'

export function useMarkdownSheets(action) {
    const linkSheet = useBottomSheet()
    const tableSheet = useBottomSheet()
    const imageSheet = useBottomSheet()
    const { run } = action
    const { onOpen: openLink } = linkSheet
    const { onOpen: openTable } = tableSheet
    const { onOpen: openImage } = imageSheet

    const onRunAction = useCallback((actionName) => {
        if (actionName === MARKDOWN_ACTIONS.LINK) {
            openLink()
            return
        }

        if (actionName === MARKDOWN_ACTIONS.TABLE) {
            openTable()
            return
        }

        if (actionName === MARKDOWN_ACTIONS.IMAGE) {
            openImage()
            return
        }

        run(actionName)
    }, [run, openLink, openTable, openImage])

    return { onRunAction, linkSheet, tableSheet, imageSheet }
}
