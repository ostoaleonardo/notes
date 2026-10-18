import { entityKey, listRelations } from '@/utils/connection-model'

import { CONNECTION_SECTIONS, CONNECTION_TYPES, RELATION_BADGES } from '@/constants/connections'

const { ROOT, FOLDER, NOTE, MISSING } = CONNECTION_TYPES
const { LINKS_OUT, LINKS_IN, NOTES } = CONNECTION_SECTIONS

export const buildTreeIndex = (tree) => {
    const index = new Map()

    const visit = (node) => {
        index.set(node.id, node)
        node.children.forEach(visit)
    }

    visit(tree)

    return index
}

const sectionEntities = (entity, model, key) => (
    listRelations(entity, model).find((section) => section.key === key)?.entities || []
)

const linkedNotes = (entity, model) => {
    const outgoing = new Set(sectionEntities(entity, model, LINKS_OUT).map(entityKey))
    const incoming = new Set(sectionEntities(entity, model, LINKS_IN).map(entityKey))
    const byKey = new Map()

    const linked = [
        ...sectionEntities(entity, model, LINKS_OUT),
        ...sectionEntities(entity, model, LINKS_IN)
    ]

    linked.forEach((item) => byKey.set(entityKey(item), item))

    return [...byKey.entries()].map(([key, item]) => {
        const both = outgoing.has(key) && incoming.has(key)
        let relation = RELATION_BADGES.IN

        if (both) relation = RELATION_BADGES.BOTH
        else if (outgoing.has(key)) relation = RELATION_BADGES.OUT

        return { entity: item, relation }
    })
}

export const getSatellites = (entity, model, treeIndex) => {
    switch (entity.type) {
        case ROOT:
        case FOLDER:
            return (treeIndex.get(entityKey(entity))?.children || []).map((node) => ({
                entity: node.entity
            }))
        case NOTE:
            return linkedNotes(entity, model)
        case MISSING:
            return sectionEntities(entity, model, LINKS_IN).map((item) => ({ entity: item }))
        default:
            return sectionEntities(entity, model, NOTES).map((item) => ({ entity: item }))
    }
}

export const paginate = (items, page, size) => {
    const pages = Math.max(1, Math.ceil(items.length / size))
    const current = Math.min(Math.max(page, 0), pages - 1)

    return { items: items.slice(current * size, (current + 1) * size), page: current, pages }
}

export const layoutFocusRing = ({
    width,
    height,
    count,
    nodeWidth,
    nodeHeight,
    reserve,
    margin,
    maxAspect
}) => {
    const centerX = width / 2
    const centerY = (height - reserve) / 2
    const radiusX = Math.max(0, (width - nodeWidth) / 2 - margin)
    const fitY = Math.max(0, (height - reserve - nodeHeight) / 2 - margin)
    const radiusY = Math.min(fitY, radiusX * maxAspect)

    return {
        center: { x: centerX, y: centerY },
        positions: Array.from({ length: count }, (_, index) => {
            const angle = -Math.PI / 2 + (index * 2 * Math.PI) / count

            return {
                x: centerX + radiusX * Math.cos(angle),
                y: centerY + radiusY * Math.sin(angle)
            }
        })
    }
}
