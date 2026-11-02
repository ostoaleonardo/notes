import { buildConnectionModel } from '@/utils/connection-model'

let last = null

const sameFiles = (a, b) => (
    a.length === b.length && a.every((file, index) => file.id === b[index].id)
)

const isSameInput = (input) => (
    last !== null &&
    last.input.notes === input.notes &&
    last.input.notePaths === input.notePaths &&
    last.input.rootName === input.rootName &&
    sameFiles(last.input.files, input.files)
)

export const getConnectionModel = (input) => {
    if (isSameInput(input)) return last.model

    last = { input, model: buildConnectionModel(input) }

    return last.model
}

export const clearConnectionModelCache = () => {
    last = null
}
