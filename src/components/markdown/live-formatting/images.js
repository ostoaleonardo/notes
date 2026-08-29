import { Decoration } from '@codemirror/view'
import { IMAGE_NODE_NAMES } from '@/constants/markdown-live-formatting'
import { collectMarks, isRangeSelected } from './utils'
import { ImageWidget } from './widgets'

export const imageNodeNames = IMAGE_NODE_NAMES

export const decorateImage = (node, { doc, selection, ranges, mediaMap }) => {
    if (isRangeSelected(selection, node.from, node.to)) return true

    const marks = collectMarks(node.node)
    if (marks.length < 4) return true

    const urlNode = node.node.getChild('URL')
    const rawUrl = urlNode ? doc.sliceString(urlNode.from, urlNode.to) : ''
    const url = mediaMap?.get(rawUrl) || rawUrl
    const alt = doc.sliceString(marks[0].to, marks[1].from)

    ranges.push(Decoration.replace({ widget: new ImageWidget(url, alt) }).range(node.from, node.to))

    return true
}

export const imagesTheme = () => ({
    '.cm-live-image': { maxWidth: '100%', borderRadius: '8px', display: 'block', margin: '0.4em 0' }
})
