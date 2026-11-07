import { useCallback } from 'react'
import { Linking } from 'react-native'

import { useAttachmentFiles } from './use-attachment-files'
import { useMentionLinker } from './use-mention-linker'
import { useMissingNote } from './use-missing-note'
import { useOpenFile } from './use-open-file'
import { findFileByTarget } from '@/utils/attachments'
import { getEditorPath } from '@/utils/editor-path'
import { resolveLinkPress } from '@/utils/link-press'
import { pushOnce } from '@/utils/navigation'

import { LINK_TYPES } from '@/constants/link-types'
import { ROUTES } from '@/constants/routes'

export function useEditorLinkHandlers({ id, onTagPress, onJumpToAnchor }) {
    const missingNote = useMissingNote()
    const linkMention = useMentionLinker(id)
    const listFiles = useAttachmentFiles()
    const openFile = useOpenFile()

    const { setMissing } = missingNote

    const onLinkPress = useCallback((url) => {
        const link = resolveLinkPress(url)
        if (!link) return

        switch (link.type) {
            case LINK_TYPES.TAG:
                onTagPress?.(link.tag)
                break
            case LINK_TYPES.MISSING_NOTE:
                setMissing(link.missing)
                break
            case LINK_TYPES.NOTE:
                if (link.id === id && link.anchor) onJumpToAnchor(link.anchor)
                else pushOnce(getEditorPath(link.id, link.anchor))
                break
            case LINK_TYPES.LINK_MENTION:
                linkMention(link.path)
                break
            case LINK_TYPES.FILE:
                openFile(findFileByTarget(listFiles(), link.target))
                break
            default:
                Linking.openURL(link.url)
        }
    }, [
        id,
        onJumpToAnchor,
        onTagPress,
        setMissing,
        linkMention,
        listFiles,
        openFile
    ])

    const onImagePress = useCallback((url) => pushOnce({
        pathname: ROUTES.IMAGE_VIEWER,
        params: { url: encodeURIComponent(url) }
    }), [])

    return { onLinkPress, onImagePress, missingNote }
}
