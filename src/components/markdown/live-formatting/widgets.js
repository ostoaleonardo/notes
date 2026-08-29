import { WidgetType } from '@codemirror/view'

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
        container.innerHTML = this.html

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
