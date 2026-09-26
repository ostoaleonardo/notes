import { Tags } from '@/screens/modals/tags'
import { ModalSheet } from '@/components/modal/modal-sheet'

export function TagsSheet({ sheet, tags, setTags }) {
    return (
        <ModalSheet
            ref={sheet.ref}
            onClose={sheet.onClose}
            snapPoints={['50%', '95%']}
        >
            <Tags
                tags={tags}
                setTags={setTags}
            />
        </ModalSheet>
    )
}
