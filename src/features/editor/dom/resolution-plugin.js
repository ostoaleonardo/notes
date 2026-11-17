import { StateEffect, StateField } from '@codemirror/state'
import { ViewPlugin } from '@codemirror/view'

import { LINK_RESOLUTION_DEBOUNCE_MS } from '@/features/editor/dom/constants/link-resolution'

export const resolutionReset = StateEffect.define()

export const lastValue = (values) => values[values.length - 1]

export const createResolvedField = (resolvedEffect) => StateField.define({
    create: () => new Map(),
    update: (resolved, tr) => {
        let next = resolved

        for (const effect of tr.effects) {
            if (effect.is(resolutionReset)) next = new Map()
            if (effect.is(resolvedEffect)) next = new Map([...next, ...Object.entries(effect.value)])
        }

        return next
    }
})

const hasReset = (update) => update.transactions.some((tr) => tr.effects.some((effect) => effect.is(resolutionReset)))

export const createResolutionPlugin = ({ resolverFacet, field, resolvedEffect, collectTargets }) => (
    ViewPlugin.fromClass(class {
        constructor(view) {
            this.view = view
            this.timer = null
            this.generation = 0
            this.pending = new Set()
            this.schedule()
        }

        update(update) {
            if (hasReset(update)) {
                this.generation++
                this.pending.clear()
            }

            if (update.docChanged || hasReset(update)) this.schedule()
        }

        schedule() {
            clearTimeout(this.timer)
            this.timer = setTimeout(() => this.resolve(), LINK_RESOLUTION_DEBOUNCE_MS)
        }

        async resolve() {
            const { state } = this.view
            const resolveTargets = state.facet(resolverFacet)?.current
            if (!resolveTargets) return

            const known = state.field(field)
            const targets = collectTargets(state)
                .filter((target) => !known.has(target) && !this.pending.has(target))
            if (!targets.length) return

            const { generation } = this
            targets.forEach((target) => this.pending.add(target))

            const resolved = await resolveTargets(targets)

            if (generation !== this.generation || !this.view.dom.isConnected) return

            targets.forEach((target) => this.pending.delete(target))
            this.view.dispatch({ effects: resolvedEffect.of(resolved) })
        }

        destroy() {
            clearTimeout(this.timer)
            this.generation++
        }
    })
)
