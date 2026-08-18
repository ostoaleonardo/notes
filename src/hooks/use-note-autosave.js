import { useEffect } from 'react'

export function useNoteAutosave({
    id,
    title,
    note,
    categories,
    images,
    password,
    biometrics,
    createdAt,
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
                categories,
                images,
                password,
                biometrics,
                createdAt
            })
        }, 500)

        return () => clearTimeout(timer)
    }, [id, title, note, categories, images, password, biometrics, createdAt, skip])
}
