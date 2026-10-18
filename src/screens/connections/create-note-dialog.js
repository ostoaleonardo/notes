import { MissingNoteDialog } from '@/components/missing-note-dialog'

export function CreateNoteDialog({ missingNote }) {
    return (
        <MissingNoteDialog
            missing={missingNote.missing}
            onDismiss={missingNote.dismiss}
            onConfirm={missingNote.create}
        />
    )
}
