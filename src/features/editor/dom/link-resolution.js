import { Facet, StateEffect } from '@codemirror/state'

import { fullSyntaxTree } from './full-syntax-tree'
import { findWikiLinkRanges } from './live-formatting/wiki-links'
import { createResolutionPlugin, createResolvedField, lastValue, resolutionReset } from './resolution-plugin'
import { isSameNoteTarget } from '@/shared/utils/wiki-links'

export const linkResolverFacet = Facet.define({ combine: lastValue })

export const linksResolved = StateEffect.define()
export const linksReset = resolutionReset

export const resolvedLinksField = createResolvedField(linksResolved)

const collectLinkTargets = (state) => (
    [...new Set(findWikiLinkRanges(fullSyntaxTree(state), state.doc.toString()).map(({ linkText }) => linkText))]
        .filter((target) => !isSameNoteTarget(target))
)

export const linkResolution = [
    resolvedLinksField,
    createResolutionPlugin({
        resolverFacet: linkResolverFacet,
        field: resolvedLinksField,
        resolvedEffect: linksResolved,
        collectTargets: collectLinkTargets
    })
]
