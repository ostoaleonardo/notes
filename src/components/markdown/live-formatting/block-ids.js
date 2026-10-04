import { Decoration } from '@codemirror/view'

import { findBlocks } from '@/utils/block-refs'

import { BLOCK_ID_LIVE_CLASS, BLOCK_ID_MUTED_OPACITY } from '@/constants/block-refs'

export const decorateBlockIds = ({ text, ranges }) => {
    const markDecoration = Decoration.mark({ class: BLOCK_ID_LIVE_CLASS })

    findBlocks(text).forEach(({ idFrom, idTo }) => {
        ranges.push(markDecoration.range(idFrom, idTo))
    })
}

export const blockIdsTheme = ({ colors }) => ({
    [`.${BLOCK_ID_LIVE_CLASS}`]: { color: colors.onBackground, opacity: BLOCK_ID_MUTED_OPACITY }
})
