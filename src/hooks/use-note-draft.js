import { useState } from 'react'

import { buildNotePayload } from '@/utils/note-payload'

export function useNoteDraft(pathRef) {
    const [title, setTitle] = useState('')
    const [note, setNote] = useState('')
    const [tags, setTags] = useState([])
    const [properties, setProperties] = useState({})
    const [modifiedAt, setModifiedAt] = useState('')
    const [repositoryId, setRepositoryId] = useState('')
    const [filename, setFilename] = useState('')
    const [invalidFrontmatter, setInvalidFrontmatter] = useState(null)
    const [rawFrontmatter, setRawFrontmatter] = useState(null)

    const buildPayload = (payloadTitle, payloadNote = note) => buildNotePayload({
        path: pathRef.current,
        title: payloadTitle,
        note: payloadNote,
        tags,
        properties,
        repositoryId,
        invalidFrontmatter,
        rawFrontmatter
    })

    const editorProps = {
        title, setTitle,
        note, setNote,
        tags, setTags,
        properties, setProperties,
        modifiedAt,
        repositoryId,
        filename,
        invalidFrontmatter, setInvalidFrontmatter,
        rawFrontmatter, setRawFrontmatter
    }

    return {
        editorProps,
        title, setTitle,
        note, setNote,
        tags, setTags,
        properties, setProperties,
        modifiedAt, setModifiedAt,
        repositoryId, setRepositoryId,
        filename, setFilename,
        invalidFrontmatter, setInvalidFrontmatter,
        rawFrontmatter, setRawFrontmatter,
        buildPayload
    }
}
