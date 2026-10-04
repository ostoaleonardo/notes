import { memo } from 'react'

import { LinkMarkdown } from '@/screens/modals/link-markdown'
import { TableMarkdown } from '@/screens/modals/table-markdown'
import { ImageMarkdown } from '@/screens/modals/image-markdown'
import { ModalSheet } from '@/components/modal/modal-sheet'

export const MarkdownInsertSheets = memo(function MarkdownInsertSheets({ linkSheet, tableSheet, imageSheet, repositoryId, action }) {
    return (
        <>
            <ModalSheet
                enableDynamicSizing
                ref={linkSheet.ref}
                onClose={linkSheet.onClose}
            >
                <LinkMarkdown
                    onClose={linkSheet.onClose}
                    onInsert={(payload) => action.run('link', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={tableSheet.ref}
                onClose={tableSheet.onClose}
                enablePanDownToClose={false}
            >
                <TableMarkdown
                    onClose={tableSheet.onClose}
                    onInsert={(payload) => action.run('table', payload)}
                />
            </ModalSheet>

            <ModalSheet
                enableDynamicSizing
                ref={imageSheet.ref}
                onClose={imageSheet.onClose}
            >
                <ImageMarkdown
                    onClose={imageSheet.onClose}
                    repositoryId={repositoryId}
                    onInsert={(payload) => action.run(payload.embed ? 'image-embed' : 'image', payload)}
                />
            </ModalSheet>
        </>
    )
})
