import { AttachFile } from '@/icons/attach-file'
import { Checklist } from '@/icons/checklist'
import { DoneAll } from '@/icons/done-all'
import { Folder } from '@/icons/folder'
import { FormatListBulleted } from '@/icons/format-list-bulleted'
import { Keep } from '@/icons/keep'
import { NoteStack } from '@/icons/note-stack'
import { Notes } from '@/icons/notes'
import { Picture } from '@/icons/picture'
import { Tag } from '@/icons/tag'
import { Title } from '@/icons/title'

export const FILTER_ICONS = {
    tag: Tag,
    path: Folder,
    file: NoteStack,
    property: FormatListBulleted,
    'task-todo': Checklist,
    'task-done': DoneAll,
    images: Picture,
    files: AttachFile,
    pinned: Keep,
    content: Notes,
    line: FormatListBulleted,
    section: Title
}

export const GROUP_ICONS = {
    tag: Tag,
    path: Folder,
    file: NoteStack,
    property: FormatListBulleted,
    task: Checklist,
    'task-todo': Checklist,
    'task-done': DoneAll,
    has: AttachFile,
    is: Keep,
    content: Notes,
    line: FormatListBulleted,
    block: FormatListBulleted,
    section: Title,
    'match-case': Title,
    'ignore-case': Title
}
