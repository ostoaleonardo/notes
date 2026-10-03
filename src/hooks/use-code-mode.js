import { useCallback, useState } from 'react'

import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'

export function useCodeMode({
    note,
    tags,
    properties,
    invalidFrontmatter,
    setNote,
    setTags,
    setProperties,
    setInvalidFrontmatter
}) {
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(buildNoteFileContent({ tags, properties, invalidFrontmatter }, note))
    }, [tags, properties, invalidFrontmatter, note])

    const onChange = useCallback((value) => {
        const decomposed = decomposeNoteFileContent(value)

        setCodeBuffer(value)
        setNote(decomposed.body)
        setInvalidFrontmatter(decomposed.invalidFrontmatter)
        if (decomposed.tags) setTags(decomposed.tags)
        if (decomposed.properties) setProperties(decomposed.properties)
    }, [setNote, setTags, setProperties, setInvalidFrontmatter])

    return { codeBuffer, enter, onChange }
}
