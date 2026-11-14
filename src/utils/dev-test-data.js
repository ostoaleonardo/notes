import { buildNoteFileContent } from '@/utils/frontmatter'
import { parseBundledKey } from '@/utils/bundled-asset'

import { NOTE_FILE_EXTENSION } from '@/constants/file-storage'
import {
    DEV_DATA_KINDS,
    NOTES_PER_FOLDER,
    TREE_BRANCHING
} from '@/constants/dev-menu'

export const parseDevDataKey = parseBundledKey

export const listDevFolders = (branching = TREE_BRANCHING) => {
    const folders = []

    for (let f = 1; f <= branching; f++) {
        folders.push([`Folder ${f}`])

        for (let s = 1; s <= branching; s++) {
            folders.push([`Folder ${f}`, `Subfolder ${f}.${s}`])
        }
    }

    return folders
}

const buildFolderNotes = (folder, label, notesPerFolder) => (
    Array.from({ length: notesPerFolder }, (_, index) => {
        const number = index + 1
        const title = `${label} note ${number}`
        const link = number === 1 ? '\n\nBack to [[Test index]].' : ''

        return {
            folder,
            filename: `${title}${NOTE_FILE_EXTENSION}`,
            content: buildNoteFileContent(
                { tags: [`folders/${label}`] },
                `# ${title}\n\nExample content.${link}\n`
            )
        }
    })
)

const withAncestors = (folders) => {
    const keys = new Map()

    folders.forEach((folder) => {
        folder.forEach((_, index) => {
            const path = folder.slice(0, index + 1)
            keys.set(path.join('/'), path)
        })
    })

    return [...keys.values()].sort((a, b) => a.length - b.length)
}

export const groupDevData = (entries) => ({
    notes: entries.filter(({ kind }) => kind === DEV_DATA_KINDS.NOTES),
    templates: entries.filter(({ kind }) => kind === DEV_DATA_KINDS.TEMPLATES),
    files: entries.filter(({ kind }) => kind === DEV_DATA_KINDS.ATTACHMENTS)
})

export const buildDevTestPlan = (
    { notes, templates, files },
    branching = TREE_BRANCHING,
    notesPerFolder = NOTES_PER_FOLDER
) => {
    const generatedFolders = listDevFolders(branching)
    const folders = withAncestors([...generatedFolders, ...notes.map(({ folder }) => folder)])

    const folderNotes = [[], ...generatedFolders].flatMap((folder) => (
        buildFolderNotes(folder, folder.at(-1) ?? 'Root', notesPerFolder)
    ))

    return {
        folders,
        notes: [...notes, ...folderNotes],
        templates,
        files
    }
}
