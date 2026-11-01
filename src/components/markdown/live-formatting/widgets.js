import { WidgetType } from '@codemirror/view'
import DOMPurify from 'dompurify'

import { filePressFacet } from './file-press'
import { renderPdfPage } from '../pdf-render'

import { buildFileLinkUrl } from '@/utils/file-links'

import {
    EMBED_LIVE_MEDIA_CLASS,
    EMBED_LIVE_PDF_CLASS,
    EMBED_PDF_ESTIMATED_HEIGHT,
    EMBED_PLAYER_PRELOAD,
    EMBED_VIDEO_FRAME_FRAGMENT
} from '@/constants/embeds'
import { FILE_KINDS } from '@/constants/file-types'

export class HtmlWidget extends WidgetType {
    constructor(html, className) {
        super()
        this.html = html
        this.className = className
    }

    eq(other) {
        return other.html === this.html && other.className === this.className
    }

    toDOM(view) {
        const container = document.createElement('div')
        container.className = this.className
        container.innerHTML = DOMPurify.sanitize(this.html)

        container.addEventListener('mousedown', (event) => {
            event.preventDefault()
            const pos = view.posAtDOM(container)
            view.dispatch({ selection: { anchor: pos }, scrollIntoView: true })
            view.focus()
        })

        return container
    }
}

export class ImageWidget extends WidgetType {
    constructor(src, alt) {
        super()
        this.src = src
        this.alt = alt
    }

    eq(other) {
        return other.src === this.src && other.alt === this.alt
    }

    toDOM() {
        const img = document.createElement('img')
        img.className = 'cm-live-image'
        img.src = this.src
        img.alt = this.alt
        return img
    }
}

export class MediaWidget extends WidgetType {
    constructor(kind, src) {
        super()
        this.kind = kind
        this.src = src
    }

    eq(other) {
        return other.kind === this.kind && other.src === this.src
    }

    toDOM() {
        const isAudio = this.kind === FILE_KINDS.AUDIO
        const player = document.createElement(isAudio ? 'audio' : 'video')
        player.className = EMBED_LIVE_MEDIA_CLASS
        player.controls = true
        player.preload = EMBED_PLAYER_PRELOAD
        player.src = isAudio ? this.src : this.src + EMBED_VIDEO_FRAME_FRAGMENT
        return player
    }
}

export class PdfWidget extends WidgetType {
    constructor(src, name, page) {
        super()
        this.src = src
        this.name = name
        this.page = page
    }

    eq(other) {
        return other.src === this.src && other.page === this.page
    }

    get estimatedHeight() {
        return EMBED_PDF_ESTIMATED_HEIGHT
    }

    toDOM(view) {
        const container = document.createElement('div')
        container.className = EMBED_LIVE_PDF_CLASS
        container.dataset.name = this.name
        container.addEventListener('click', () => {
            view.state.facet(filePressFacet)?.current?.(buildFileLinkUrl(this.name))
        })

        renderPdfPage(container, this.src, this.page)
            .then((canvas) => {
                container.appendChild(canvas)
                view.requestMeasure()
            })
            .catch(() => { container.textContent = this.name })

        return container
    }
}

export class CheckboxWidget extends WidgetType {
    constructor(checked, from, to) {
        super()
        this.checked = checked
        this.from = from
        this.to = to
    }

    eq(other) {
        return other.checked === this.checked && other.from === this.from && other.to === this.to
    }

    toDOM(view) {
        const input = document.createElement('input')
        input.type = 'checkbox'
        input.className = 'cm-live-checkbox'
        input.checked = this.checked

        input.addEventListener('mousedown', (event) => event.preventDefault())
        input.addEventListener('change', () => {
            view.dispatch({ changes: { from: this.from, to: this.to, insert: this.checked ? '[ ]' : '[x]' } })
        })

        return input
    }
}
