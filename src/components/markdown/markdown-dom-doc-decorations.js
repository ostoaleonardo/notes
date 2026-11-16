import { syntaxTree } from '@codemirror/language'
import { ViewPlugin } from '@codemirror/view'

export const buildDocDecorationsPlugin = (build, { followSyntaxTree = false } = {}) => ViewPlugin.fromClass(class {
    constructor(view) {
        this.decorations = build(view)
    }

    update(update) {
        const treeChanged = followSyntaxTree && syntaxTree(update.startState) !== syntaxTree(update.state)

        if (update.docChanged || treeChanged) this.decorations = build(update.view)
    }
}, {
    decorations: (instance) => instance.decorations
})
