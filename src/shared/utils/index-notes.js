import { buildNotePath } from '@/shared/utils/note-path'
import { seedNoteLinkTexts } from '@/shared/utils/note-links'
import { seedNoteTags } from '@/shared/utils/note-tags'
import { dedupeTags } from '@/shared/utils/tag-names'

export const buildNoteFromMetadata = (metadata) => {
    const note = {
        filename: metadata.filename,
        repositoryId: metadata.repositoryId,
        path: buildNotePath(metadata.repositoryId, metadata.filename),
        fileUri: metadata.fileUri,
        title: metadata.title,
        tags: metadata.tags,
        properties: metadata.properties,
        invalidFrontmatter: metadata.invalidFrontmatter,
        rawFrontmatter: metadata.rawFrontmatter,
        createdAt: metadata.createdAt,
        updatedAt: metadata.updatedAt
    }

    seedNoteTags(note, dedupeTags([...metadata.tags, ...metadata.inlineTags]))
    seedNoteLinkTexts(note, metadata.linkTexts)

    return note
}

export const createIndexedNotesLoader = (fs) => async (repositoryIds) => (
    JSON.parse(await fs.listNoteMetadata(repositoryIds)).map(buildNoteFromMetadata)
)
