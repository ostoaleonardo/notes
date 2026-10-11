import {
    SYNTAX_LINKED_TITLE,
    SYNTAX_LINKED_TAGS,
    SYNTAX_LINKED_PROPERTIES,
    SYNTAX_LINKED_BODY,
    SYNTAX_EMBED_TITLE,
    SYNTAX_EMBED_TAGS,
    SYNTAX_EMBED_BODY,
    SYNTAX_MAIN_TITLE,
    SYNTAX_MAIN_TAGS,
    SYNTAX_MAIN_PROPERTIES,
    SYNTAX_MAIN_BODY
} from '@/constants/syntax-note'
import { DEV_TEST_FILES, DEV_TEST_NOTES, DEV_TEST_TEMPLATES } from '@/constants/dev-test-data'
import { NOTES_PER_FOLDER, TREE_BRANCHING } from '@/constants/dev-menu'

const SYNTAX_NOTES = [
    {
        folder: [],
        title: SYNTAX_LINKED_TITLE,
        tags: SYNTAX_LINKED_TAGS,
        properties: SYNTAX_LINKED_PROPERTIES,
        body: SYNTAX_LINKED_BODY
    },
    {
        folder: [],
        title: SYNTAX_EMBED_TITLE,
        tags: SYNTAX_EMBED_TAGS,
        body: SYNTAX_EMBED_BODY
    },
    {
        folder: [],
        title: SYNTAX_MAIN_TITLE,
        tags: SYNTAX_MAIN_TAGS,
        properties: SYNTAX_MAIN_PROPERTIES,
        body: SYNTAX_MAIN_BODY
    }
]

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
            title,
            tags: [`folders/${label}`],
            body: `# ${title}\n\nExample content.${link}\n`
        }
    })
)

export const buildDevTestPlan = (branching = TREE_BRANCHING, notesPerFolder = NOTES_PER_FOLDER) => {
    const folders = listDevFolders(branching)

    const folderNotes = [[], ...folders].flatMap((folder) => (
        buildFolderNotes(folder, folder.at(-1) ?? 'Root', notesPerFolder)
    ))

    return {
        folders,
        notes: [...DEV_TEST_NOTES, ...SYNTAX_NOTES, ...folderNotes],
        templates: DEV_TEST_TEMPLATES,
        files: DEV_TEST_FILES
    }
}
