import {
    BLOCKQUOTE_NODE,
    CALLOUT_START_PATTERN,
    NOTE_NODES,
    SETEXT_HEADING_NODE
} from '@/constants/note-syntax'

class CalloutParser {
    constructor(markerLength) {
        this.markerLength = markerLength
    }

    nextLine() {
        return false
    }

    finish(cx, leaf) {
        const markerEnd = leaf.start + this.markerLength

        cx.addLeafElement(leaf, cx.elt(
            NOTE_NODES.CALLOUT,
            leaf.start,
            leaf.start + leaf.content.length,
            [
                cx.elt(NOTE_NODES.CALLOUT_MARKER, leaf.start, markerEnd),
                ...cx.parser.parseInline(leaf.content.slice(this.markerLength), markerEnd)
            ]
        ))

        return true
    }
}

export const callout = {
    defineNodes: [
        { name: NOTE_NODES.CALLOUT, block: true },
        NOTE_NODES.CALLOUT_MARKER
    ],
    parseBlock: [{
        name: NOTE_NODES.CALLOUT,
        leaf: (cx, leaf) => {
            const match = cx.parentType().name === BLOCKQUOTE_NODE && CALLOUT_START_PATTERN.exec(leaf.content)

            return match ? new CalloutParser(match[0].length) : null
        },
        after: SETEXT_HEADING_NODE
    }]
}
