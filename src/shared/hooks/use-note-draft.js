import { useCallback, useMemo, useState } from 'react'

import { buildNotePayload } from '@/shared/utils/note-payload'

const EMPTY_DRAFT = {
    title: '',
    note: '',
    tags: [],
    properties: {},
    folderId: '',
    filename: '',
    invalidFrontmatter: null,
    rawFrontmatter: null
}

const FIELDS = Object.keys(EMPTY_DRAFT)

const buildInitialDraft = (initial) => Object.fromEntries(
    FIELDS.map((field) => [field, initial[field] ?? EMPTY_DRAFT[field]])
)

const mergeDraft = (draft, changes) => {
    const changed = FIELDS.filter((field) => field in changes && !Object.is(changes[field], draft[field]))

    return changed.length ? { ...draft, ...Object.fromEntries(changed.map((field) => [field, changes[field]])) } : draft
}

export function useNoteDraft(pathRef, initial = {}) {
    const [draft, setDraft] = useState(() => buildInitialDraft(initial))

    const update = useCallback((changes) => setDraft((current) => mergeDraft(current, changes)), [])

    const setters = useMemo(() => Object.fromEntries(FIELDS.map((field) => [
        field,
        (value) => setDraft((current) => {
            const next = typeof value === 'function' ? value(current[field]) : value

            return mergeDraft(current, { [field]: next })
        })
    ])), [])

    const {
        title,
        note,
        tags,
        properties,
        folderId,
        filename,
        invalidFrontmatter,
        rawFrontmatter
    } = draft

    const buildPayload = useCallback((payloadTitle, payloadNote = note) => buildNotePayload({
        path: pathRef.current,
        title: payloadTitle,
        note: payloadNote,
        tags,
        properties,
        folderId,
        invalidFrontmatter,
        rawFrontmatter
    }), [
        pathRef,
        note,
        tags,
        properties,
        folderId,
        invalidFrontmatter,
        rawFrontmatter
    ])

    const editorProps = {
        title, setTitle: setters.title,
        note, setNote: setters.note,
        tags, setTags: setters.tags,
        properties, setProperties: setters.properties,
        folderId,
        filename,
        invalidFrontmatter,
        rawFrontmatter,
        update
    }

    return {
        editorProps,
        update,
        title, setTitle: setters.title,
        note, setNote: setters.note,
        tags, setTags: setters.tags,
        properties, setProperties: setters.properties,
        folderId, setFolderId: setters.folderId,
        filename, setFilename: setters.filename,
        invalidFrontmatter, setInvalidFrontmatter: setters.invalidFrontmatter,
        rawFrontmatter, setRawFrontmatter: setters.rawFrontmatter,
        buildPayload
    }
}
