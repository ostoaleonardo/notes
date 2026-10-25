import { memo } from 'react'

import { Tags } from '@/screens/modals/tags'
import { ModalBottomSheet } from '@/components/modal/modal-bottom-sheet'

import { SHEET } from '@/constants/components'

export const TagsSheet = memo(function TagsSheet({ sheet, tags, setTags }) {
    return (
        <ModalBottomSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET.snapPoints.tall}
        >
            <Tags
                tags={tags}
                setTags={setTags}
            />
        </ModalBottomSheet>
    )
})
