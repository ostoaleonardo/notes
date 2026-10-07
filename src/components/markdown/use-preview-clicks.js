import { useEffect } from 'react'

import { resolvePreviewClick } from './markdown-dom-preview-click'

import { PREVIEW_CLICK_TYPES } from '@/constants/preview-click'

export const usePreviewClicks = (previewRef, { onLinkPress, onImagePress, onToggleTask, onEdit }) => {
    useEffect(() => {
        const container = previewRef.current
        if (!container) return

        const onClick = (event) => {
            const click = resolvePreviewClick(event.target, container)
            if (!click) return

            switch (click.type) {
                case PREVIEW_CLICK_TYPES.LINK:
                    event.preventDefault()
                    onLinkPress?.(click.url)
                    break
                case PREVIEW_CLICK_TYPES.IMAGE:
                    onImagePress?.(click.url)
                    break
                case PREVIEW_CLICK_TYPES.TASK:
                    onToggleTask?.(click.index)
                    break
                default:
                    event.preventDefault()
            }
        }

        const onDoubleClick = (event) => {
            if (!resolvePreviewClick(event.target, container)) onEdit?.()
        }

        container.addEventListener('click', onClick)
        container.addEventListener('dblclick', onDoubleClick)
        return () => {
            container.removeEventListener('click', onClick)
            container.removeEventListener('dblclick', onDoubleClick)
        }
    }, [previewRef, onLinkPress, onImagePress, onToggleTask, onEdit])
}
