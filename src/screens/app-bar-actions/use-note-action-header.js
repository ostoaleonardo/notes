import { useAppBarTrailing } from '@/hooks'
import { NoteAction } from './note-action'

export function useNoteActionHeader({
    password,
    onOpenPassword,
    onOpenTemplates,
    onSaveAsTemplate
}) {
    useAppBarTrailing((
        <NoteAction
            hasPassword={password}
            onOpenPassword={onOpenPassword}
            onOpenTemplates={onOpenTemplates}
            onSaveAsTemplate={onSaveAsTemplate}
        />
    ), [password, onSaveAsTemplate])
}
