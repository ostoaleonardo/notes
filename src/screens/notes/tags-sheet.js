import { memo } from 'react'

import { Tags } from '@/screens/modals/tags'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SHEET_SNAP_POINTS } from '@/constants/sheet'

export const TagsSheet = memo(function TagsSheet({ sheet, tags, setTags }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET_SNAP_POINTS.TALL}
        >
            <Tags
                tags={tags}
                setTags={setTags}
            />
        </ModalSheet>
    )
})
