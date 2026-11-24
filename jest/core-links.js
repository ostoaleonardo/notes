import { WIKI_LINK_PATTERN } from '@/shared/constants/wiki-links'
import { resolveWikiLinkTarget } from '@/shared/utils/wiki-links'

const MARKDOWN_TARGET_PATTERN = /\]\(wikilink:\/\/([^)]+)\)/g

export const findBacklinkPaths = (
    titles,
    aliases,
    paths,
    folders,
    targetPath,
    candidatePaths,
    candidateBodies
) => {
    const notes = paths.map((path, index) => ({
        path,
        title: titles[index],
        properties: { aliases: aliases[index] }
    }))
    const notePaths = new Map(Object.entries(folders))

    return candidatePaths.filter((path, index) => {
        if (path === targetPath) return false

        const body = candidateBodies[index]
        const markdown = Array.from(body.matchAll(MARKDOWN_TARGET_PATTERN), (match) => match[1])
        const wiki = Array.from(body.matchAll(WIKI_LINK_PATTERN), (match) => match[1])

        return markdown.includes(targetPath) || wiki.some((text) => (
            resolveWikiLinkTarget(text, notes, notePaths)?.path === targetPath
        ))
    })
}
