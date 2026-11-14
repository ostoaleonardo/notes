import { syntaxTree } from '@codemirror/language'

import { LEZER_NODES } from '@/constants/lezer-nodes'

const FULL_REBUILD_RATIO = 0.5

const touches = (block, range) => block.from <= range.to && block.to >= range.from

const blockKey = (name, from, to) => `${name}:${from}:${to}`

const getTopBlocks = (state) => {
    const blocks = []
    let child = syntaxTree(state).topNode.firstChild

    while (child) {
        blocks.push({ name: child.name, from: child.from, to: child.to })
        child = child.nextSibling
    }

    return blocks
}

const mergeZones = (zones) => {
    const sorted = [...zones].sort((a, b) => a.from - b.from)

    return sorted.reduce((merged, zone) => {
        const last = merged[merged.length - 1]

        if (last && zone.from <= last.to) last.to = Math.max(last.to, zone.to)
        else merged.push({ ...zone })

        return merged
    }, [])
}

const snapToLines = (doc, zone) => ({
    from: doc.lineAt(zone.from).from,
    to: doc.lineAt(Math.min(zone.to, doc.length)).to
})

const expandZone = (decorations, doc, zone) => {
    let current = snapToLines(doc, zone)
    let previous

    do {
        previous = current
        let { from, to } = current

        decorations.between(from, to, (rangeFrom, rangeTo) => {
            from = Math.min(from, rangeFrom)
            to = Math.max(to, rangeTo)
        })

        current = snapToLines(doc, { from, to })
    } while (current.from !== previous.from || current.to !== previous.to)

    return current
}

export const applyZones = (decorations, state, rawZones, collect, rebuildAll) => {
    if (!rawZones.length) return decorations

    const zones = mergeZones(rawZones.map((zone) => expandZone(decorations, state.doc, zone)))
    const size = zones.reduce((total, zone) => total + zone.to - zone.from, 0)

    if (size > state.doc.length * FULL_REBUILD_RATIO) return rebuildAll(state)

    return zones.reduce((current, zone) => current.update({
        filter: () => false,
        filterFrom: zone.from,
        filterTo: zone.to
    }).update({
        add: collect(state, zone.from, zone.to),
        sort: true
    }), decorations)
}

export const selectionZones = (tr) => {
    const { startState, state } = tr

    return [startState.selection.main, state.selection.main].flatMap((selection) => (
        getTopBlocks(state).filter((block) => touches(block, selection))
    ))
}

export const changedZones = (tr) => {
    const { startState, state, changes } = tr
    const oldBlocks = getTopBlocks(startState)
    const newBlocks = getTopBlocks(state)
    const changedA = []
    const changedB = []

    changes.iterChangedRanges((fromA, toA, fromB, toB) => {
        changedA.push({ from: fromA, to: toA })
        changedB.push({ from: fromB, to: toB })
    })

    const oldSelection = startState.selection.main
    const selections = [
        state.selection.main,
        { from: changes.mapPos(oldSelection.from, -1), to: changes.mapPos(oldSelection.to, 1) }
    ]
    const mappedOld = oldBlocks.map((block) => {
        const from = changes.mapPos(block.from, 1)
        const to = Math.max(from, changes.mapPos(block.to, -1))

        return { name: block.name, from, to, key: blockKey(block.name, from, to) }
    })
    const oldKeys = new Set(mappedOld.map((block) => block.key))
    const newKeys = new Set(newBlocks.map((block) => blockKey(block.name, block.from, block.to)))
    const removed = mappedOld.filter((block) => !newKeys.has(block.key))

    const dirty = newBlocks.filter((block) => (
        !oldKeys.has(blockKey(block.name, block.from, block.to))
        || changedB.some((range) => touches(block, range))
        || selections.some((selection) => touches(block, selection))
    ))

    const hasReference = dirty.some((block) => block.name === LEZER_NODES.LINK_REFERENCE)
        || oldBlocks.some((block) => (
            block.name === LEZER_NODES.LINK_REFERENCE && changedA.some((range) => touches(block, range))
        ))

    return hasReference ? null : [...dirty, ...changedB, ...removed]
}
