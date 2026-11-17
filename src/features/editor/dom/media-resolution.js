import { Facet, StateEffect } from '@codemirror/state'

import { fullSyntaxTree } from './full-syntax-tree'
import { findWikiLinkRanges } from './live-formatting/wiki-links'
import { createResolutionPlugin, createResolvedField, lastValue } from './resolution-plugin'
import { parseEmbedMedia } from '@/features/editor/shared/utils/embed-media'

export const mediaResolverFacet = Facet.define({ combine: lastValue })

export const mediaResolved = StateEffect.define()

export const resolvedMediaField = createResolvedField(mediaResolved)

const collectMediaNames = (state) => {
    const names = new Set()

    for (const { linkText, isEmbed } of findWikiLinkRanges(fullSyntaxTree(state), state.doc.toString())) {
        const { name, kind } = isEmbed ? parseEmbedMedia(linkText.trim()) : {}
        if (kind) names.add(name)
    }

    return [...names]
}

export const mediaResolution = [
    resolvedMediaField,
    createResolutionPlugin({
        resolverFacet: mediaResolverFacet,
        field: resolvedMediaField,
        resolvedEffect: mediaResolved,
        collectTargets: collectMediaNames
    })
]
