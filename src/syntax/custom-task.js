import {
    CUSTOM_TASK_MARKER_LENGTH,
    CUSTOM_TASK_START_PATTERN,
    LIST_ITEM_NODE,
    NOTE_NODES,
    SETEXT_HEADING_NODE
} from '@/constants/note-syntax'

class CustomTaskParser {
    nextLine() {
        return false
    }

    finish(cx, leaf) {
        const markerEnd = leaf.start + CUSTOM_TASK_MARKER_LENGTH

        cx.addLeafElement(leaf, cx.elt(
            NOTE_NODES.CUSTOM_TASK,
            leaf.start,
            leaf.start + leaf.content.length,
            [
                cx.elt(NOTE_NODES.CUSTOM_TASK_MARKER, leaf.start, markerEnd),
                ...cx.parser.parseInline(leaf.content.slice(CUSTOM_TASK_MARKER_LENGTH), markerEnd)
            ]
        ))

        return true
    }
}

export const customTask = {
    defineNodes: [
        { name: NOTE_NODES.CUSTOM_TASK, block: true },
        NOTE_NODES.CUSTOM_TASK_MARKER
    ],
    parseBlock: [{
        name: NOTE_NODES.CUSTOM_TASK,
        leaf: (cx, leaf) => (
            CUSTOM_TASK_START_PATTERN.test(leaf.content) && cx.parentType().name === LIST_ITEM_NODE
                ? new CustomTaskParser()
                : null
        ),
        after: SETEXT_HEADING_NODE
    }]
}
