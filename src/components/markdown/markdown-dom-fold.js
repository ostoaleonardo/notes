import { foldService, syntaxTree } from '@codemirror/language'

import { ATX_HEADING_LEVELS } from '@/constants/markdown-live-formatting'

export const headingFoldService = foldService.of((state, lineStart, lineEnd) => {
    let headingNode = null
    let level = null

    syntaxTree(state).iterate({
        from: lineStart,
        to: lineEnd,
        enter: (node) => {
            const nodeLevel = ATX_HEADING_LEVELS[node.name]
            if (nodeLevel) {
                headingNode = node
                level = nodeLevel
                return false
            }
        }
    })

    if (!headingNode) return null

    const { doc } = state
    const startLine = doc.lineAt(headingNode.to)
    let endPos = doc.length

    for (let lineNumber = startLine.number + 1; lineNumber <= doc.lines; lineNumber++) {
        const line = doc.line(lineNumber)
        const match = line.text.match(/^(#{1,6})\s/)
        if (match && match[1].length <= level) {
            endPos = line.from - 1
            break
        }
    }

    const from = startLine.to
    if (endPos <= from) return null

    return { from, to: endPos }
})
