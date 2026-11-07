import { MissingNoteDialog } from '@/components/missing-note-dialog'

export const CreateNoteDialog = ({ missingNote }) => {
    return (
        <MissingNoteDialog
            missing={missingNote.missing}
            onDismiss={missingNote.dismiss}
            onConfirm={missingNote.create}
        />
    )
}
