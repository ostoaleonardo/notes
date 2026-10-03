import { useCallback, useState } from 'react'

import { useTags } from './use-tags'
import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'
import { hasTag } from '@/utils/tag-names'

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
    const { tags: allTags, addTag } = useTags()
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(buildNoteFileContent({ tags, properties, invalidFrontmatter }, note))
    }, [tags, properties, invalidFrontmatter, note])

    const leave = useCallback(() => {
        tags
            .filter((name) => !hasTag(allTags, name))
            .forEach((name) => addTag(name))
    }, [tags, allTags, addTag])

    const onChange = useCallback((value) => {
        const decomposed = decomposeNoteFileContent(value)

        setCodeBuffer(value)
        setNote(decomposed.body)
        setInvalidFrontmatter(decomposed.invalidFrontmatter)
        if (decomposed.tags) setTags(decomposed.tags)
        if (decomposed.properties) setProperties(decomposed.properties)
    }, [setNote, setTags, setProperties, setInvalidFrontmatter])

    return { codeBuffer, enter, leave, onChange }
}
