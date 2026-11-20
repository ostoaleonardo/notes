import { useCallback, useState } from 'react'

import { composeNoteFile, decomposeNoteFile } from '@/shared/utils/note-file-content'

export function useCodeMode({ content, update }) {
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(composeNoteFile(content, content.note))
    }, [content])

    const onChange = useCallback((value) => {
        const { body, tags, properties, invalidFrontmatter, rawFrontmatter } = decomposeNoteFile(value)

        setCodeBuffer(value)
        update({
            note: body,
            invalidFrontmatter,
            rawFrontmatter,
            ...(tags && { tags }),
            ...(properties && { properties })
        })
    }, [update])

    return { codeBuffer, enter, onChange }
}
