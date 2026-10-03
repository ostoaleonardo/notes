import { getNoteTags } from './note-tags'

import { DEFAULT_TAG_SORT, TAG_PATH_SEPARATOR, TAG_SORTS } from '@/constants/tags'

const compareByName = (a, b) => a.name.localeCompare(b.name)
const compareByCount = (a, b) => a.uses - b.uses

const TAG_COMPARATORS = {
    [TAG_SORTS.NAME_ASC]: compareByName,
    [TAG_SORTS.NAME_DESC]: (a, b) => compareByName(b, a),
    [TAG_SORTS.COUNT_DESC]: (a, b) => compareByCount(b, a) || compareByName(a, b),
    [TAG_SORTS.COUNT_ASC]: (a, b) => compareByCount(a, b) || compareByName(a, b)
}

export const buildTagTree = (notes) => {
    const root = new Map()

    for (const note of notes) {
        for (const tag of getNoteTags(note)) {
            const segments = tag.split(TAG_PATH_SEPARATOR).filter(Boolean)
            let level = root
            let key = ''

            segments.forEach((segment) => {
                key = key ? key + TAG_PATH_SEPARATOR + segment.toLowerCase() : segment.toLowerCase()

                if (!level.has(key)) {
                    level.set(key, {
                        key,
                        name: segment,
                        children: new Map(),
                        uses: 0
                    })
                }

                const node = level.get(key)
                node.uses += 1
                level = node.children
            })
        }
    }

    return root
}

export const flattenTagTree = (tree, expanded, sort = DEFAULT_TAG_SORT, depth = 0) => (
    [...tree.values()].sort(TAG_COMPARATORS[sort] || compareByName).flatMap((node) => {
        const isExpanded = expanded.has(node.key)
        const row = {
            id: 'tag:' + node.key,
            key: node.key,
            name: node.name,
            depth,
            count: node.uses,
            hasChildren: node.children.size > 0,
            expanded: isExpanded
        }

        return isExpanded
            ? [row, ...flattenTagTree(node.children, expanded, sort, depth + 1)]
            : [row]
    })
)

export const collectTagKeys = (tree) => (
    [...tree.values()].flatMap((node) => [node.key, ...collectTagKeys(node.children)])
)
