import { dataUrlToBytes } from '@/utils/data-url'

import { EMBED_PDF_MAX_PIXEL_RATIO } from '@/constants/embeds'

let pdfjsPromise = null

const loadPdfjs = () => {
    pdfjsPromise ??= Promise.all([
        import('pdfjs-dist/build/pdf.min.mjs'),
        import('pdfjs-dist/build/pdf.worker.min.mjs')
    ]).then(([pdfjs, worker]) => {
        globalThis.pdfjsWorker = worker
        return pdfjs
    })

    return pdfjsPromise
}

export const renderPdfPage = async (container, dataUrl, pageNumber) => {
    const bytes = dataUrlToBytes(dataUrl)
    if (!bytes) throw new Error('invalid pdf data url')

    const pdfjs = await loadPdfjs()
    const task = pdfjs.getDocument({ data: bytes, isEvalSupported: false })
    const doc = await task.promise

    try {
        const page = await doc.getPage(Math.min(Math.max(pageNumber, 1), doc.numPages))
        const base = page.getViewport({ scale: 1 })
        const cssWidth = container.clientWidth || base.width
        const ratio = Math.min(globalThis.devicePixelRatio || 1, EMBED_PDF_MAX_PIXEL_RATIO)
        const viewport = page.getViewport({ scale: (cssWidth / base.width) * ratio })

        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = '100%'
        canvas.style.display = 'block'

        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise

        return canvas
    } finally {
        task.destroy()
    }
}
