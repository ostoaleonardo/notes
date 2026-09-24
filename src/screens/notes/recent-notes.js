import { useCallback, useMemo } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton } from 'react-native-paper'

import { CardGrid } from './card-grid'
import { IconToggleGroup } from '@/components/button/icon-toggle-group'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useNotes } from '@/hooks/use-notes'
import { useTemplatesList } from '@/hooks/use-templates-list'
import { useUtils } from '@/hooks/use-utils'
import { getEditorPath } from '@/utils/editor-path'
import { getPreviewNote } from '@/utils/preview-note'
import { getRecentIds } from '@/utils/recent-ids'

import { Close } from '@/icons/close'
import { KeepFilled } from '@/icons/keep-filled'
import { Plus } from '@/icons/plus'

import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export function RecentNotes({ onClose, home = false }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { pinned, updatePinned } = useUtils()
    const { activeRepositoryTree } = useRepositories()
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
                    title: t(`templates.${template.name}`, template.name),
                    preview: getPreviewNote(template.content),
                    pinned: pinned.has(id),
                    active: id === currentId
                }
            }

            const note = notes.find((entry) => entry.id === id)

            return {
                id,
                title: note.title || t('notes.untitled'),
                preview: getPreviewNote(note.note),
                pinned: pinned.has(id),
                active: id === currentId
            }
        })
    }, [pinned, recent, notes, templates, currentId])

    const onCreateNote = () => {
        onClose()
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId: activeRepositoryTree[0]?.id }
        })
    }

    const onOpen = useCallback((card) => {
        if (card.active) return

        onClose()

        const path = getEditorPath(card.id)
        if (currentId) {
            router.replace(path)
        } else {
            router.push(path)
        }
    }, [onClose, currentId])

    const onRemove = useCallback((card) => {
        if (card.pinned) {
            const next = new Set(pinned)
            next.delete(card.id)
            updatePinned(next)
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
            size={4}
            mode='contained'
            onPress={() => onRemove(card)}
            style={styles.removeButton}
            icon={(props) => (
                card.pinned
                    ? <KeepFilled {...props} />
                    : <Close {...props} />
            )}
            accessibilityLabel={
                t(card.pinned ? 'button.unpin' : 'button.close')
            }
        />
    ), [onRemove, t])

    const onClearAll = () => {
        clearRecent()

        if (currentId) {
            onClose()
            router.push(ROUTES.HOME)
        }
    }

    const onGoHome = () => {
        onClose()
        router.push(ROUTES.HOME)
    }

    const actionButtons = [
        {
            icon: Plus,
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

            <View style={styles.actions}>
                <IconToggleGroup buttons={actionButtons} />
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
        paddingVertical: 24,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'center'
    },
    removeButton: {
        alignSelf: 'flex-end'
    }
})
