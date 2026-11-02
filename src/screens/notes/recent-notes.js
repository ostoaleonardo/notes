import { useCallback, useMemo } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import { CardGrid } from './card-grid'
import { ButtonGroup } from '@/ui/button/button-group'
import { IconButton } from '@/ui/button/icon-button'
import { useSheetBottomSpacing } from '@/ui/hooks/use-sheet-bottom-spacing'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useDefaultNoteFolder } from '@/hooks/use-default-note-folder'
import { useNotes } from '@/hooks/use-notes'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useUtils } from '@/hooks/use-utils'
import { getEditorNavigation } from '@/utils/editor-path'
import { getPreviewNote } from '@/utils/preview-note'
import { getRecentIds } from '@/utils/recent-ids'
import { toggleInSet } from '@/utils/toggle-in-set'
import { pushOnce } from '@/utils/navigation'

import { Close } from '@/icons/close'
import { KeepFilled } from '@/icons/keep-filled'
import { Add } from '@/icons/add'

import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'
import { SPACING } from '@/constants/theme'
import { ICON_BUTTON } from '@/ui/tokens/components'

export function RecentNotes({ onClose, home = false }) {
    const { t } = useTranslation()
    const bottom = useSheetBottomSpacing()
    const defaultFolderId = useDefaultNoteFolder()

    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { pinned, updatePinned } = useUtils()
    const { templates } = useTemplatesList()
    const { recent, removeRecent, clearRecent } = useRecentNotes()

    const cards = useMemo(() => {
        const ids = getRecentIds(pinned, recent, notes, templates)

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
                preview: getPreviewNote(note.note),
                pinned: pinned.has(id),
                active: id === currentId
            }
        })
    }, [pinned, recent, notes, templates, currentId, t])

    const onCreateNote = () => {
        onClose()
        pushOnce({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId: defaultFolderId }
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

            <View style={[styles.actions, { paddingBottom: bottom }]}>
                <ButtonGroup buttons={actionButtons} />
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'space-between'
    },
    actions: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: SPACING.md,
        paddingHorizontal: SPACING.lg
    },
    removeButton: {
        alignSelf: 'flex-end'
    }
})
