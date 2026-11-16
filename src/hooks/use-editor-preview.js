import { useMemo } from 'react'

import { useBacklinksHtml } from './use-backlinks-html'
import { useEmbedMediaMap } from './use-embed-media-map'
import { usePdfEmbed } from './use-pdf-embed'

import { EDITOR_MODES } from '@/constants/editor-modes'

export function useEditorPreview({ id, mode, value, showBacklinks }) {
    const reading = mode === EDITOR_MODES.READ

    const pdfEmbedded = usePdfEmbed()
    const backlinksHtml = useBacklinksHtml(id, reading && showBacklinks)
    const embedMediaMap = useEmbedMediaMap(value, mode === EDITOR_MODES.LIVE, pdfEmbedded)

    const mediaMapEntries = useMemo(() => [...embedMediaMap], [embedMediaMap])

    return { readValue: reading ? value : '', mediaMapEntries, backlinksHtml }
}
