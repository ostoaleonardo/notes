import { memo } from 'react'

import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import { ModalBottomSheet } from '@/components/modal/modal-bottom-sheet'

import { MARKDOWN_ACTIONS } from '@/constants/markdown-actions'

export const MarkdownInsertSheets = memo(function MarkdownInsertSheets({
    linkSheet,
    tableSheet,
    imageSheet,
    repositoryId,
    action
}) {
    return (
        <>
            <ModalBottomSheet
                enableDynamicSizing
                ref={linkSheet.ref}
                onClose={linkSheet.onClose}
            >
                <LinkMarkdown
                    onClose={linkSheet.onClose}
                    onInsert={(payload) => action.run(MARKDOWN_ACTIONS.LINK, payload)}
                />
            </ModalBottomSheet>

            <ModalBottomSheet
                enableDynamicSizing
                ref={tableSheet.ref}
                onClose={tableSheet.onClose}
                enablePanDownToClose={false}
                dismissOnClickOutside
            >
                <TableMarkdown
                    onClose={tableSheet.onClose}
                    onInsert={(payload) => action.run(MARKDOWN_ACTIONS.TABLE, payload)}
                />
            </ModalBottomSheet>

            <ModalBottomSheet
                enableDynamicSizing
                ref={imageSheet.ref}
                onClose={imageSheet.onClose}
            >
                <ImageMarkdown
                    onClose={imageSheet.onClose}
                    repositoryId={repositoryId}
                    onInsert={(payload) => action.run(
                        payload.embed ? MARKDOWN_ACTIONS.IMAGE_EMBED : MARKDOWN_ACTIONS.IMAGE,
                        payload
                    )}
                />
            </ModalBottomSheet>
        </>
    )
})
