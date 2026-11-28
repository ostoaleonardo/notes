import { parseNoteMarkdown } from '../shared/markdown-dom-render-html'

import { EMBED_MAX_DEPTH } from '@/shared/constants/embeds'
import { missingWikiLinkDetails } from '@/shared/utils/wiki-links'

const NO_RESULTS = {}

export const createReadCache = () => ({
    details: new Map(),
    media: new Map(),
    local: new Map(),
    embeds: new Map()
})

const unknownOf = (items, known) => [...new Set(items)].filter((item) => !known.has(item))

const ask = (items, request) => (items.length ? request(items) : Promise.resolve(NO_RESULTS))

const childrenOf = (level, cache) => [...new Set(
    level.flatMap((parsed) => parsed.embedTargets)
        .map((target) => cache.embeds.get(target)?.parsed)
        .filter(Boolean)
)]

export const resolveReadContext = async (parsed, services, cache) => {
    let level = [parsed]

    for (let depth = 0; level.length; depth++) {
        const canEmbed = depth < EMBED_MAX_DEPTH
        const links = unknownOf(level.flatMap((item) => item.targets), cache.details)
        const names = unknownOf(level.flatMap((item) => item.mediaNames), cache.media)
        const urls = unknownOf(level.flatMap((item) => item.localUrls), cache.local)
        const embeds = canEmbed ? unknownOf(level.flatMap((item) => item.embedTargets), cache.embeds) : []

        const [details, media, local, loaded] = await Promise.all([
            ask(links, services.resolveLinks),
            ask(names, services.resolveMedia),
            ask(urls, services.resolveLocalUrls),
            ask(embeds, services.loadEmbeds)
        ])

        links.forEach((target) => cache.details.set(target, details[target] ?? missingWikiLinkDetails(target)))
        names.forEach((name) => cache.media.set(name, media[name] ?? null))
        urls.forEach((url) => cache.local.set(url, local[url] ?? url))
        embeds.forEach((target) => cache.embeds.set(
            target,
            loaded[target] ? { ...loaded[target], parsed: parseNoteMarkdown(loaded[target].text) } : null
        ))

        level = canEmbed ? childrenOf(level, cache) : []
    }

    return {
        details: new Map(cache.details),
        media: new Map(cache.media),
        local: new Map(cache.local),
        embeds: new Map(cache.embeds)
    }
}
