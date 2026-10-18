import {
    ROOT_ENTITY,
    entityKey,
    entityTitle,
    makeEntity,
    splitFolder
} from '@/utils/connection-model'

import { CONNECTION_NODE_KINDS, CONNECTION_TYPES, FOLDER_SEPARATOR } from '@/constants/connections'

const { FOLDER, FILE } = CONNECTION_TYPES
const { ROOT, FOLDER: FOLDER_KIND, FILE: FILE_KIND, NOTE: NOTE_KIND } = CONNECTION_NODE_KINDS

const getKind = (entity) => {
    if (entity.type === FOLDER) return FOLDER_KIND
    if (entity.type === FILE) return FILE_KIND

    return NOTE_KIND
}

const makeNode = (entity) => ({
    id: entityKey(entity),
    entity,
    kind: getKind(entity),
    children: [],
    leaves: 0
})

const sortChildren = (node, model) => {
    node.children.sort((a, b) => {
        const folderOrder = Number(b.kind === FOLDER_KIND) - Number(a.kind === FOLDER_KIND)

        return folderOrder ||
            entityTitle(a.entity, model).localeCompare(entityTitle(b.entity, model))
    })

    node.children.forEach((child) => sortChildren(child, model))

    node.leaves = node.children.reduce((total, child) => (
        total + (child.kind === FOLDER_KIND ? child.leaves : 1)
    ), 0)
}

const listItems = (model) => [
    ...model.notes.map((note) => ({
        entity: makeEntity(CONNECTION_TYPES.NOTE, note.path),
        segments: splitFolder(model.folderByNote.get(note.path))
    })),
    ...model.files.map((file) => ({
        entity: makeEntity(FILE, file.id),
        segments: splitFolder(file.folder)
    }))
]

export const buildPathTree = (model) => {
    const tree = { ...makeNode(ROOT_ENTITY), kind: ROOT }
    const folders = new Map()

    listItems(model).forEach(({ entity, segments }) => {
        let parent = tree
        let path = []

        segments.forEach((segment) => {
            path = [...path, segment]
            const id = path.join(FOLDER_SEPARATOR)

            if (!folders.has(id)) {
                const folder = makeNode(makeEntity(FOLDER, id))
                folders.set(id, folder)
                parent.children.push(folder)
            }

            parent = folders.get(id)
        })

        parent.children.push(makeNode(entity))
    })

    sortChildren(tree, model)

    return tree
}
