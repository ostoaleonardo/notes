import { ViewPlugin } from '@codemirror/view'

export const buildDocDecorationsPlugin = (build) => ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = build(view)
    }

    update(update) {
        if (update.docChanged) this.decorations = build(update.view)
    }
}, {
    decorations: (instance) => instance.decorations
})
