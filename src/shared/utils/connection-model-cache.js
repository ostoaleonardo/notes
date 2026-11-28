import { buildConnectionModel, buildLinkGraph } from '@/shared/utils/connection-model'

let last = null
let graph = null

const getLinkGraph = ({ notes, folderPathByNote }) => {
    if (graph?.notes !== notes || graph.folderPathByNote !== folderPathByNote) {
        graph = { notes, folderPathByNote, value: buildLinkGraph({ notes, folderPathByNote }) }
    }

    return graph.value
}

const sameFiles = (a, b) => (
    a.length === b.length && a.every((file, index) => file.id === b[index].id)
)

const isSameInput = (input) => (
    last !== null &&
    last.input.notes === input.notes &&
    last.input.folderPathByNote === input.folderPathByNote &&
    last.input.rootName === input.rootName &&
    sameFiles(last.input.files, input.files)
)

export const getConnectionModel = (input) => {
    if (isSameInput(input)) return last.model

    last = { input, model: buildConnectionModel(input, getLinkGraph(input)) }

    return last.model
}

export const clearConnectionModelCache = () => {
    last = null
    graph = null
}
