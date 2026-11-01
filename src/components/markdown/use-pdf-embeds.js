import { useEffect } from 'react'

import { renderPdfPage } from './pdf-render'

import { EMBED_PDF_CLASS, EMBED_PDF_DEFAULT_PAGE } from '@/constants/embeds'
import { FILE_LINK_CLASS } from '@/constants/file-links'

const PDF_SELECTOR = `.${EMBED_PDF_CLASS}[data-pdf]`

export const usePdfEmbeds = (previewRef, html) => {
    useEffect(() => {
        const container = previewRef.current
        if (!container) return

        let cancelled = false

        container.querySelectorAll(PDF_SELECTOR).forEach(async (link) => {
            try {
                const page = Number(link.dataset.page) || EMBED_PDF_DEFAULT_PAGE
                const canvas = await renderPdfPage(link, link.dataset.pdf, page)
                if (cancelled) return

                link.classList.remove(FILE_LINK_CLASS)
                link.replaceChildren(canvas)
            } catch {
                link.removeAttribute('data-pdf')
            }
        })

        return () => { cancelled = true }
    }, [previewRef, html])
}
