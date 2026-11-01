import { Facet } from '@codemirror/state'

export const filePressFacet = Facet.define({
    combine: (values) => values[values.length - 1]
})
