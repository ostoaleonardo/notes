import { useCallback, useState } from 'react'

import { useTags } from './use-tags'
import { buildNoteFileContent, decomposeNoteFileContent } from '@/utils/frontmatter'

export function useCodeMode({
    note,
    tags,
    invalidFrontmatter,
    setNote,
    setTags,
    setInvalidFrontmatter
}) {
    const { tags: allTags, addTag } = useTags()
    const [codeBuffer, setCodeBuffer] = useState('')

    const enter = useCallback(() => {
        setCodeBuffer(buildNoteFileContent({ tags, invalidFrontmatter }, note))
    }, [tags, invalidFrontmatter, note])

    const leave = useCallback(() => {
        tags
            .filter((name) => !allTags.includes(name))
            .forEach((name) => addTag(name))
    }, [tags, allTags, addTag])

    const onChange = useCallback((value) => {
        const decomposed = decomposeNoteFileContent(value)

        setCodeBuffer(value)
        setNote(decomposed.body)
        setInvalidFrontmatter(decomposed.invalidFrontmatter)
        if (decomposed.tags) setTags(decomposed.tags)
    }, [setNote, setTags, setInvalidFrontmatter])

    return { codeBuffer, enter, leave, onChange }
}
