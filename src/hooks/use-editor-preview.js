import { useMemo } from 'react'

import { useBacklinksHtml } from './use-backlinks-html'
import { useEmbedMediaMap } from './use-embed-media-map'
import { usePdfEmbed } from './use-pdf-embed'
import { useResolvedPreviewMarkdown } from './use-resolved-preview-markdown'
import { useResolvedWikiLinks } from './use-resolved-wiki-links'

import { EDITOR_MODES } from '@/constants/editor-modes'

export function useEditorPreview({ id, mode, value, showBacklinks }) {
    const reading = mode === EDITOR_MODES.READ

    const pdfEmbedded = usePdfEmbed()
    const backlinksHtml = useBacklinksHtml(id, reading && showBacklinks)
    const valueWithWikiLinks = useResolvedWikiLinks(reading ? value : '', id, pdfEmbedded)
    const { value: previewValue, mediaMap } = useResolvedPreviewMarkdown(valueWithWikiLinks)
    const embedMediaMap = useEmbedMediaMap(value, mode === EDITOR_MODES.LIVE, pdfEmbedded)

    const mediaMapEntries = useMemo(() => [...mediaMap, ...embedMediaMap], [mediaMap, embedMediaMap])

    return { previewValue, mediaMapEntries, backlinksHtml }
}
