import { useCallback, useState } from 'react'

import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'

export function useCodeMode({ content, update }) {
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(buildNoteFileContent(content, content.note))
    }, [content])

    const onChange = useCallback((value) => {
        const { body, tags, properties, invalidFrontmatter, rawFrontmatter } = decomposeNoteFileContent(value)

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
