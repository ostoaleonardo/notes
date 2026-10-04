import { Facet } from '@codemirror/state'

export const tableLabelsFacet = Facet.define({
    combine: (values) => values[values.length - 1] || {}
})
