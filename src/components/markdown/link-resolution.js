import { Facet, StateEffect, StateField } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'

import { fullSyntaxTree } from './full-syntax-tree'
import { findWikiLinkRanges } from './live-formatting/wiki-links'
import { isSameNoteTarget } from '@/utils/wiki-links'

import { LINK_RESOLUTION_DEBOUNCE_MS } from '@/constants/link-resolution'

export const linkResolverFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})

export const linksResolved = StateEffect.define()
export const linksReset = StateEffect.define()

export const resolvedLinksField = StateField.define({
    create: () => new Map(),
    update: (resolved, tr) => {
        let next = resolved

        for (const effect of tr.effects) {
            if (effect.is(linksReset)) next = new Map()
            if (effect.is(linksResolved)) next = new Map([...next, ...Object.entries(effect.value)])
        }

        return next
    }
})

const hasLinksReset = (update) => update.transactions.some((tr) => tr.effects.some((effect) => effect.is(linksReset)))

const resolutionPlugin = ViewPlugin.fromClass(class {
    constructor(view) {
        this.view = view
        this.timer = null
        this.generation = 0
        this.pending = new Set()
        this.schedule()
    }

    update(update) {
        if (hasLinksReset(update)) {
            this.generation++
            this.pending.clear()
        }

        if (update.docChanged || hasLinksReset(update)) this.schedule()
    }

    schedule() {
        clearTimeout(this.timer)
        this.timer = setTimeout(() => this.resolve(), LINK_RESOLUTION_DEBOUNCE_MS)
    }

    async resolve() {
        const { state } = this.view
        const resolveLinks = state.facet(linkResolverFacet)?.current
        if (!resolveLinks) return

        const known = state.field(resolvedLinksField)
        const targets = [...new Set(findWikiLinkRanges(fullSyntaxTree(state), state.doc.toString()).map(({ linkText }) => linkText))]
            .filter((target) => !known.has(target) && !this.pending.has(target) && !isSameNoteTarget(target))
        if (!targets.length) return

        const { generation } = this
        targets.forEach((target) => this.pending.add(target))

        const resolved = await resolveLinks(targets)

        if (generation !== this.generation || !this.view.dom.isConnected) return

        targets.forEach((target) => this.pending.delete(target))
        this.view.dispatch({ effects: linksResolved.of(resolved) })
    }

    destroy() {
        clearTimeout(this.timer)
        this.generation++
    }
})

export const linkResolution = [resolvedLinksField, resolutionPlugin]
