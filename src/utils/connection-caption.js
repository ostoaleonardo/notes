import { CONNECTION_TYPES } from '@/constants/connections'

const { ROOT, NOTE, FOLDER, FILE, TAG, MISSING } = CONNECTION_TYPES

const countNotes = (entity, model) => {
    switch (entity.type) {
        case ROOT:
            return model.notes.length
        case TAG:
            return (model.tagNotes.get(entity.id) || []).length
        case FOLDER:
            return model.notes.filter((note) => {
                const folder = model.folderByNote.get(note.path)

                return folder === entity.id || folder.startsWith(entity.id + '/')
            }).length
        default:
            return 0
    }
}

export const describeEntity = (entity, model, t) => {
    switch (entity.type) {
        case NOTE:
            return model.folderByNote.get(entity.id) || model.rootName
        case MISSING:
            return t('connections.not_found')
        case FILE:
            return model.fileById.get(entity.id)?.folder || model.rootName
        case ROOT:
        case TAG:
        case FOLDER:
            return t('count.notes', { count: countNotes(entity, model) })
        default:
            return ''
    }
}
