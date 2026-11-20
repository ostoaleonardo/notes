import { useCallback, useMemo } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { CardGrid } from './card-grid'
import { ButtonGroup } from '@/ui/button/button-group'
import { SheetActions } from '@/ui/modal/sheet-actions'
import { IconButton } from '@/ui/button/icon-button'

import { useCurrentNote } from '@/shared/hooks/use-current-note'
import { useRecentNotes } from '@/shared/hooks/use-recent-notes'
import { useDefaultNoteFolder } from '@/shared/hooks/use-default-note-folder'
import { useNoteBodies } from '@/shared/hooks/use-note-bodies'
import { useNotes } from '@/shared/hooks/use-notes'
import { useTemplatesList } from '@/shared/hooks/use-templates-list'
import { useUtils } from '@/shared/hooks/use-utils'
import { getEditorNavigation } from '@/shared/utils/editor-path'
import { getPreviewNote } from '@/features/editor/native/utils/preview-note'
import { bodyOf } from '@/shared/utils/note-body-of'
import { getRecentIds } from '@/shared/utils/recent-ids'
import { toggleInSet } from '@/shared/utils/toggle-in-set'
import { pushOnce } from '@/shared/utils/navigation'

import { Close } from '@/icons/close'
import { KeepFilled } from '@/icons/keep-filled'
import { Add } from '@/icons/add'

import { ROUTES } from '@/shared/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/shared/constants/tabs'
import { ICON_BUTTON } from '@/ui/tokens/components'

export const RecentNotes = ({ onClose, home = false }) => {
    const { t } = useTranslation()
    const defaultFolderId = useDefaultNoteFolder()

    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { pinned, updatePinned } = useUtils()
    const { templates } = useTemplatesList()
    const { recent, removeRecent, clearRecent } = useRecentNotes()

    const ids = useMemo(
        () => getRecentIds(pinned, recent, notes, templates),
        [pinned, recent, notes, templates]
    )

    const recentNotes = useMemo(() => ids
        .filter((id) => !id.startsWith(TEMPLATE_TAB_PREFIX))
        .map((id) => notes.find((entry) => entry.path === id))
        .filter(Boolean), [ids, notes])

    const bodies = useNoteBodies(recentNotes)

    const cards = useMemo(() => {
        return ids.map((id) => {
            if (id.startsWith(TEMPLATE_TAB_PREFIX)) {
                const filename = id.slice(TEMPLATE_TAB_PREFIX.length)
                const template = templates.find((entry) => entry.filename === filename)

                return {
                    id,
                    title: t(`templates.names.${template.name}`, template.name),
                    preview: getPreviewNote(template.content),
                    pinned: pinned.has(id),
                    active: id === currentId
                }
            }

            const note = notes.find((entry) => entry.path === id)

            return {
                id,
                title: note.title || t('notes.untitled'),
                preview: getPreviewNote(bodyOf(note, bodies)),
                pinned: pinned.has(id),
                active: id === currentId
            }
        })
    }, [ids, pinned, notes, templates, currentId, bodies, t])

    const onCreateNote = () => {
        onClose()
        pushOnce({
            pathname: ROUTES.ADD_NOTE,
            params: { folderId: defaultFolderId }
        })
    }

    const onOpen = useCallback((card) => {
        if (card.active) return

        onClose()

        const { path, replace } = getEditorNavigation(card.id, currentId)
        replace ? router.replace(path) : pushOnce(path)
    }, [onClose, currentId])

    const onRemove = useCallback((card) => {
        if (card.pinned) {
            updatePinned(toggleInSet(pinned, card.id))
        } else {
            removeRecent(card.id)
        }

        if (card.active) {
            onClose()
            router.back()
        }
    }, [pinned, updatePinned, removeRecent, onClose])

    const renderCardHeader = useCallback((card) => (
        <IconButton
            appearance={ICON_BUTTON.remove}
            style={styles.removeButton}
            icon={card.pinned ? KeepFilled : Close}
            label={t(card.pinned ? 'button.unpin' : 'button.close')}
            onPress={() => onRemove(card)}
        />
    ), [onRemove, t])

    const onClearAll = () => {
        clearRecent()

        if (currentId) {
            onClose()
            pushOnce(ROUTES.HOME)
        }
    }

    const onGoHome = () => {
        onClose()
        pushOnce(ROUTES.HOME)
    }

    const actionButtons = [
        {
            icon: Add,
            label: t('notes.create'),
            onPress: onCreateNote
        },
        {
            showLabel: true,
            label: t('notes.go_home'),
            disabled: home,
            onPress: onGoHome
        },
        {
            icon: Close,
            label: t('button.close_all'),
            disabled: recent.length === 0,
            onPress: onClearAll
        }
    ]

    return (
        <View style={styles.container}>
            <CardGrid
                cards={cards}
                onOpen={onOpen}
                renderHeader={renderCardHeader}
                emptyMessage={t('message.notes.no_recent')}
            />

            <SheetActions>
                <ButtonGroup buttons={actionButtons} />
            </SheetActions>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between'
    },
    removeButton: {
        alignSelf: 'flex-end'
    }
})
