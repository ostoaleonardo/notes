import { EditorView, keymap } from '@codemirror/view'
import { autocompletion, closeBrackets } from '@codemirror/autocomplete'
import { defaultKeymap, history, historyKeymap, indentWithTab, redoDepth, undoDepth } from '@codemirror/commands'
import { search, searchKeymap } from '@codemirror/search'
import { codeFolding, indentUnit } from '@codemirror/language'
import { markdown } from '@codemirror/lang-markdown'
import { GFM } from '@lezer/markdown'

import { wikiLinkCompletionSource, blockCompletionSource, blockIdCreatorFacet } from './wiki-link-completion'
import { tagCompletionSource } from './tag-completion'
import { inlineTagExtensions } from './inline-tag-highlight'
import { fileLinkPress } from './live-formatting/wiki-links'
import { listKeymap } from './markdown-dom-list-keymap'
import { headingFoldService } from './markdown-dom-fold'
import { pasteUrlOverSelection } from './markdown-dom-paste'

import { LIST_INDENT } from '@/constants/markdown-patterns'

const createHiddenSearchPanel = () => {
    const dom = document.createElement('div')
    dom.style.display = 'none'
    return { dom }
}

export const buildUpdateListener = ({ onChangeRef, onHistoryChangeRef, historyRef, lastEmittedValueRef, pendingEmittedRef }) => (
    EditorView.updateListener.of((update) => {
        if (update.docChanged) {
            const newValue = update.state.doc.toString()
            lastEmittedValueRef.current = newValue
            pendingEmittedRef.current.add(newValue)
            onChangeRef.current(newValue)
        }

        const canUndo = undoDepth(update.state) > 0
        const canRedo = redoDepth(update.state) > 0

        if (canUndo !== historyRef.current.canUndo || canRedo !== historyRef.current.canRedo) {
            historyRef.current = { canUndo, canRedo }
            onHistoryChangeRef.current?.(historyRef.current)
        }
    })
)

export const buildEditorExtensions = ({ dynamic, onTagPressRef, onLinkPressRef, onCreateBlockIdRef, updateListener }) => [
    history(),
    search({ createPanel: createHiddenSearchPanel }),
    keymap.of([
        indentWithTab,
        ...listKeymap,
        ...defaultKeymap,
        ...historyKeymap,
        ...searchKeymap
    ]),
    indentUnit.of(LIST_INDENT),
    markdown({ extensions: GFM }),
    inlineTagExtensions(onTagPressRef),
    fileLinkPress(onLinkPressRef),
    blockIdCreatorFacet.of(onCreateBlockIdRef),
    autocompletion({ override: [wikiLinkCompletionSource, blockCompletionSource, tagCompletionSource] }),
    closeBrackets(),
    codeFolding(),
    headingFoldService,
    pasteUrlOverSelection,
    EditorView.lineWrapping,
    ...dynamic,
    updateListener
]
