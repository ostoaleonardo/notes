import { useCallback, useState } from 'react'

import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'

export function useCodeMode({
    note,
    tags,
    properties,
    invalidFrontmatter,
    rawFrontmatter,
    setNote,
    setTags,
    setProperties,
    setInvalidFrontmatter,
    setRawFrontmatter
}) {
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(buildNoteFileContent({ tags, properties, invalidFrontmatter, rawFrontmatter }, note))
    }, [tags, properties, invalidFrontmatter, rawFrontmatter, note])

    const onChange = useCallback((value) => {
        const decomposed = decomposeNoteFileContent(value)

        setCodeBuffer(value)
        setNote(decomposed.body)
        setInvalidFrontmatter(decomposed.invalidFrontmatter)
        setRawFrontmatter(decomposed.rawFrontmatter)
        if (decomposed.tags) setTags(decomposed.tags)
        if (decomposed.properties) setProperties(decomposed.properties)
    }, [setNote, setTags, setProperties, setInvalidFrontmatter, setRawFrontmatter])

    return { codeBuffer, enter, onChange }
}
