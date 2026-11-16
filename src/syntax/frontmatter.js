import { FRONTMATTER_REGEX } from '@/constants/markdown-patterns'
import {
    FRONTMATTER_FENCE,
    FRONTMATTER_MARK_LENGTH,
    HORIZONTAL_RULE_PARSER_NAME,
    NOTE_NODES
} from '@/constants/note-syntax'

const readFrontmatter = (cx) => {
    const match = FRONTMATTER_REGEX.exec(cx.input.read(0, cx.input.length))

    if (!match) return null

    const to = match[0].trimEnd().length
    const bodyFrom = match[0].indexOf('\n') + 1

    return { to, bodyFrom, bodyTo: to - FRONTMATTER_MARK_LENGTH }
}

const parseFrontmatter = (cx, line) => {
    if (cx.lineStart !== 0 || line.text.trimEnd() !== FRONTMATTER_FENCE) return false

    const frontmatter = readFrontmatter(cx)

    if (!frontmatter) return false

    const { to, bodyFrom, bodyTo } = frontmatter
    const body = cx.input.read(bodyFrom, bodyTo)

    cx.addElement(cx.elt(NOTE_NODES.FRONTMATTER, 0, to, [
        cx.elt(NOTE_NODES.FRONTMATTER_MARK, 0, FRONTMATTER_MARK_LENGTH),
        ...cx.parser.parseInline(body, bodyFrom),
        cx.elt(NOTE_NODES.FRONTMATTER_MARK, bodyTo, to)
    ]))

    while (cx.nextLine() && cx.lineStart <= to);

    return true
}

export const frontmatter = {
    defineNodes: [{ name: NOTE_NODES.FRONTMATTER, block: true }, NOTE_NODES.FRONTMATTER_MARK],
    parseBlock: [{ name: NOTE_NODES.FRONTMATTER, parse: parseFrontmatter, before: HORIZONTAL_RULE_PARSER_NAME }]
}
