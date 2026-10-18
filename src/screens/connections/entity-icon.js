import { getFileKind } from '@/utils/attachments'

import { ArrowBack } from '@/icons/arrow-back'
import { ArrowForward } from '@/icons/arrow-forward'
import { AttachFile } from '@/icons/attach-file'
import { Folder } from '@/icons/folder'
import { FolderCode } from '@/icons/folder-code'
import { LinkOff } from '@/icons/link-off'
import { NoteStack } from '@/icons/note-stack'
import { Picture } from '@/icons/picture'
import { Sell } from '@/icons/sell'
import { Tag } from '@/icons/tag'

import { CONNECTION_SECTIONS, CONNECTION_TYPES } from '@/constants/connections'
import { FILE_KINDS } from '@/constants/file-types'

const TYPE_ICONS = {
    [CONNECTION_TYPES.ROOT]: FolderCode,
    [CONNECTION_TYPES.NOTE]: NoteStack,
    [CONNECTION_TYPES.MISSING]: LinkOff,
    [CONNECTION_TYPES.FOLDER]: Folder,
    [CONNECTION_TYPES.FILE]: AttachFile,
    [CONNECTION_TYPES.TAG]: Tag
}

export const SECTION_ICONS = {
    [CONNECTION_SECTIONS.LINKS_OUT]: ArrowForward,
    [CONNECTION_SECTIONS.LINKS_IN]: ArrowBack,
    [CONNECTION_SECTIONS.TAGS]: Tag,
    [CONNECTION_SECTIONS.FILES]: AttachFile,
    [CONNECTION_SECTIONS.NOTES]: NoteStack,
    [CONNECTION_SECTIONS.FOLDERS]: Folder,
    [CONNECTION_SECTIONS.RELATED_TAGS]: Sell
}

export const getEntityIcon = (entity, title = '') => {
    const isImage = entity.type === CONNECTION_TYPES.FILE && getFileKind(title) === FILE_KINDS.IMAGE
    if (isImage) return Picture

    return TYPE_ICONS[entity.type]
}

export function EntityIcon({ entity, title, ...props }) {
    const Icon = getEntityIcon(entity, title)

    return <Icon {...props} />
}
