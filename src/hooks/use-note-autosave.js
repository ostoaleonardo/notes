import { useEffect } from 'react'

export function useNoteAutosave({
    id,
    title,
    note,
    tags,
    images,
    password,
    biometrics,
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
                images,
                password,
                biometrics,
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
        images,
        password,
        biometrics,
        createdAt,
        repositoryId,
        skip
    ])
}
