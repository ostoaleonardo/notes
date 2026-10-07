import { memo } from 'react'

import { Tags } from '@/screens/modals/tags'
import { ModalSheet } from '@/components/modal/modal-sheet'

import { SHEET } from '@/constants/components'

export const TagsSheet = memo(function TagsSheet({ sheet, tags, setTags }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={SHEET.snapPoints.tall}
        >
            <Tags
                tags={tags}
                setTags={setTags}
            />
        </ModalSheet>
    )
})
