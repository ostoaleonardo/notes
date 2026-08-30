import { useEffect } from 'react'

export function useNoteAutosave({
    id,
    title,
    note,
    tags,
    createdAt,
    repositoryId,
    skip,
    onSave
}) {
    useEffect(() => {
        if (skip) return

        const timer = setTimeout(() => {
            onSave({
                id,
                title: title.trim(),
                note: note.trim(),
                tags,
                createdAt,
                repositoryId
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [
        id,
        title,
        note,
        tags,
        createdAt,
        repositoryId,
        skip
    ])
}
