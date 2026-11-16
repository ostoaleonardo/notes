import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch'

const differ = new DiffMatchPatch()

const sameText = (a, b) => (a ?? '').trim() === (b ?? '').trim()

const sameValue = (a, b) => JSON.stringify(a) === JSON.stringify(b)

const pickChanged = (base, mine, theirs) => (sameValue(mine, base) ? theirs : mine)

const mergeText = (base, mine, theirs) => {
    if (sameText(mine, base)) return { text: theirs, lost: false }
    if (sameText(theirs, base) || sameText(mine, theirs)) return { text: mine, lost: false }

    const [text, applied] = differ.patch_apply(differ.patch_make(base, theirs), mine)
    return applied.every(Boolean) ? { text, lost: false } : { text: mine, lost: true }
}

export const mergeNoteChanges = ({ base, mine, theirs }) => {
    const body = mergeText(base.note, mine.note, theirs.note)

    return {
        merged: {
            note: body.text,
            tags: pickChanged(base.tags, mine.tags, theirs.tags),
            properties: pickChanged(base.properties, mine.properties, theirs.properties),
            rawFrontmatter: pickChanged(base.rawFrontmatter, mine.rawFrontmatter, theirs.rawFrontmatter),
            invalidFrontmatter: pickChanged(base.invalidFrontmatter, mine.invalidFrontmatter, theirs.invalidFrontmatter)
        },
        lostExternalText: body.lost
    }
}
