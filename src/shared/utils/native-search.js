import { repositoryEngine } from '@/shared/utils/repository-engine'

import { indexCoverage } from '@/shared/utils/index-coverage'
import { buildNotePath } from '@/shared/utils/note-path'

import { SEARCH_NODE_TYPES } from '@/shared/constants/search-query'
import { SEARCH_NATIVE_STEP_SIZE } from '@/shared/constants/search-index'

const nodeOrNull = (node) => (node ? toNativeNode(node) : null)

export const toNativeNode = (node) => {
    switch (node.type) {
        case SEARCH_NODE_TYPES.AND:
        case SEARCH_NODE_TYPES.OR:
            return { type: node.type, children: node.children.map(toNativeNode) }
        case SEARCH_NODE_TYPES.NOT:
            return { type: node.type, child: toNativeNode(node.child) }
        case SEARCH_NODE_TYPES.TEXT:
            return { type: node.type, value: node.value, phrase: !!node.phrase }
        case SEARCH_NODE_TYPES.REGEX:
            return { type: node.type, pattern: node.pattern }
        case SEARCH_NODE_TYPES.FILTER:
            return { type: node.type, name: node.name, argument: nodeOrNull(node.argument) }
        case SEARCH_NODE_TYPES.PROPERTY:
            return { type: node.type, key: node.key, expression: nodeOrNull(node.expression) }
        case SEARCH_NODE_TYPES.COMPARE:
            return { type: node.type, operator: node.operator, value: node.value }
        default:
            return { type: SEARCH_NODE_TYPES.NULL }
    }
}

const toUnindexed = (note) => ({
    folderId: note.folderId,
    filename: note.filename,
    location: note.fileUri,
    title: note.title,
    modified: note.updatedAt,
    tags: note.tags ?? [],
    properties: note.properties ?? {}
})

const collectFolders = (notes, notePaths) => {
    const paths = new Map()

    notes.forEach((note) => {
        if (!paths.has(note.folderId)) paths.set(note.folderId, notePaths?.get(note.path) ?? '')
    })

    return { ids: [...paths.keys()], paths: [...paths.values()] }
}

export const createNativeCursor = ({ fs, id, notesByPath, size, isCancelled }) => {
    let exhausted = false
    const buffer = []

    const next = async (target, onProgress) => {
        const found = []

        const take = () => {
            const part = buffer.splice(0, target - found.length)
            if (!part.length) return

            found.push(...part)
            onProgress?.(part)
        }

        take()

        while (!exhausted && found.length < target) {
            if (isCancelled()) return null

            const step = await fs.searchStep(id, size)
            if (isCancelled()) return null

            exhausted = step.done

            step.filenames.forEach((filename, index) => {
                const note = notesByPath.get(buildNotePath(step.folderIds[index], filename))
                if (note) buffer.push(note)
            })

            take()
        }

        return { found, done: exhausted && buffer.length === 0 }
    }

    return { next, close: () => fs.searchClose(id) }
}

export const createNativeSearch = (fs, {
    size = SEARCH_NATIVE_STEP_SIZE,
    isIndexed = () => true
} = {}) => ({
    warm: async (notes) => {
        if (typeof fs.searchWarm !== 'function') return

        await fs.searchWarm([...new Set(notes.map((note) => note.folderId))])
    },

    open: async ({ ast, notes, notePaths, pinned, matchCase, sort, isCancelled }) => {
        if (typeof fs.searchOpen !== 'function') return null

        const folders = collectFolders(notes, notePaths)

        const id = await fs.searchOpen(JSON.stringify({
            query: toNativeNode(ast),
            sort,
            folderIds: folders.ids,
            folderPaths: Object.fromEntries(folders.ids.map((folderId, index) => [folderId, folders.paths[index]])),
            pinned: [...pinned],
            matchCase: !!matchCase,
            unindexed: notes.filter((note) => !isIndexed(note)).map(toUnindexed)
        }))

        if (id == null) return null

        return createNativeCursor({
            fs,
            id,
            notesByPath: new Map(notes.map((note) => [note.path, note])),
            size,
            isCancelled
        })
    }
})

export const nativeSearch = createNativeSearch(repositoryEngine, { isIndexed: indexCoverage.isCovered })
