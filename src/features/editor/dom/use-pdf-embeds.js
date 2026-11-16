import { useEffect } from 'react'

import { renderPdfPage } from './pdf-render'

import { EMBED_PDF_CLASS, EMBED_PDF_DEFAULT_PAGE } from '@/shared/constants/embeds'
import { FILE_LINK_CLASS } from '@/shared/constants/file-links'

const PDF_SELECTOR = `.${EMBED_PDF_CLASS}[data-pdf]`

export const embedPdfLinks = (nodes, isCancelled = () => false) => {
    nodes.forEach((node) => {
        const links = node.matches(PDF_SELECTOR) ? [node] : node.querySelectorAll(PDF_SELECTOR)

        links.forEach(async (link) => {
            try {
                const page = Number(link.dataset.page) || EMBED_PDF_DEFAULT_PAGE
                const canvas = await renderPdfPage(link, link.dataset.pdf, page)
                if (isCancelled()) return

                link.classList.remove(FILE_LINK_CLASS)
                link.replaceChildren(canvas)
            } catch {
                link.removeAttribute('data-pdf')
            }
        })
    })
}

export const usePdfEmbeds = (previewRef, html) => {
    useEffect(() => {
        const container = previewRef.current
        if (!container) return

        let cancelled = false

        embedPdfLinks([...container.children], () => cancelled)

        return () => { cancelled = true }
    }, [previewRef, html])
}
