import { Facet } from '@codemirror/state'

export const mediaMapFacet = Facet.define({
    combine: (values) => values[values.length - 1] || new Map()
})
