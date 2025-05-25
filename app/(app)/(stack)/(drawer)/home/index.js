import { useEffect, useState } from 'react'
import { View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { FloatingButton } from '@/components'
import { NotesContainer, FilterCarousel, DeleteNote, MarkdownTutorial } from '@/screens'
import { useBottomSheet, useNotes, useStorage, useUtils } from '@/hooks'
import { ROUTES, STORAGE_KEYS } from '@/constants'

export default function App() {
    const { t } = useTranslation()
    const { deleteNote } = useNotes()
    const { getItem, setItem } = useStorage()
    const { filter, onFilter, pinned, updatePinned } = useUtils()

    const [selectedNote, setSelectedNote] = useState(null)

    const {
        ref: deleteBottomRef,
        onOpen: onOpenDelete,
        onClose: onCloseDelete
    } = useBottomSheet()

    const {
        ref: markdownBottomRef,
        onOpen: onOpenMarkdown,
        onClose: onCloseMarkdown
    } = useBottomSheet()

    useEffect(() => {
        (async () => {
            const markdown = await getItem(STORAGE_KEYS.MARKDOWN_TUTORIAL) || 'true'
            if (markdown === 'true') onOpenMarkdown()
        })()
    }, [])

    const onPin = (id) => {
        if (pinned.has(id)) {
            pinned.delete(id)
        } else {
            pinned.add(id)
            onCloseDelete()
        }

        updatePinned(new Set(pinned))
    }

    const onDelete = (id, isLocked) => {
        if (isLocked) {
            setSelectedNote(id)
            onOpenDelete()
        } else {
            deleteNote(id)
        }
    }

    const onCloseMarkDownSheet = async () => {
        onCloseMarkdown()
        await setItem(STORAGE_KEYS.MARKDOWN_TUTORIAL, 'false')
    }

    return (
        <View style={{ flex: 1 }}>
            <FilterCarousel
                filter={filter}
                onFilter={onFilter}
            />
            <NotesContainer
                pinned={pinned}
                onPin={onPin}

                filter={filter}
                selectedNote={selectedNote}
                setSelectedNote={setSelectedNote}

                onDelete={onDelete}
            />

            <FloatingButton
                label={t('button.addNote')}
                href={ROUTES.ADD_NOTE}
            />

            <DeleteNote
                ref={deleteBottomRef}
                id={selectedNote}
                onClose={() => {
                    setSelectedNote(null)
                    onCloseDelete()
                }}
            />
            <MarkdownTutorial
                ref={markdownBottomRef}
                onClose={async () => {
                    onCloseMarkDownSheet()
                    await setItem(STORAGE_KEYS.MARKDOWN_TUTORIAL, 'false')
                }}
            />
        </View>
    )
}
