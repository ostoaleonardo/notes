import { useCallback, useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip } from 'react-native-paper'

import { CardGrid } from './card-grid'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useRecentNotes } from '@/hooks/use-recent-notes'
import { useRepositories } from '@/hooks/use-repositories'
import { useNotes } from '@/hooks/use-notes'
import { useTemplates } from '@/hooks/use-templates'
import { useUtils } from '@/hooks/use-utils'
import { getEditorPath } from '@/utils/editor-path'
import { getPreviewNote } from '@/utils/preview-note'
import { getRecentIds } from '@/utils/recent-ids'

import { Close } from '@/icons/close'
import { NoteStack } from '@/icons/note-stack'
import { Plus } from '@/icons/plus'

import { ROUTES } from '@/constants/routes'
import { TEMPLATE_TAB_PREFIX } from '@/constants/tabs'

export function RecentNotes({ onClose, home = false }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const { pinned, updatePinned } = useUtils()
    const { activeRepositoryTree } = useRepositories()
    const { listTemplates } = useTemplates()
    const { recent, removeRecent, clearRecent } = useRecentNotes()
    const [templates, setTemplates] = useState([])

    useEffect(() => {
        listTemplates().then(setTemplates)
    }, [])

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
        if (home) {
            router.push(path)
        } else {
            router.replace(path)
        }
    }, [onClose, home])

    const onRemove = useCallback((card) => {
        if (card.pinned) {
            const next = new Set(pinned)
            next.delete(card.id)
            updatePinned(next)
        } else {
            removeRecent(card.id)
        }
    }, [pinned, updatePinned, removeRecent])

    const onClearAll = () => {
        clearRecent()
    }

    const onGoHome = () => {
        onClose()
        router.push(ROUTES.HOME)
    }

    return (
        <View style={styles.container}>
            <CardGrid
                cards={cards}
                onOpen={onOpen}
                onRemove={onRemove}
                emptyMessage={t('message.notes.no_recent')}
            />

            <View style={styles.actions}>
                <Tooltip title={t('notes.create')}>
                    <IconButton
                        mode='contained'
                        onPress={onCreateNote}
                        icon={(props) => <Plus {...props} />}
                        accessibilityLabel={t('notes.create')}
                    />
                </Tooltip>

                {!home && (
                    <Tooltip title={t('title.notes')}>
                        <IconButton
                            mode='contained'
                            onPress={onGoHome}
                            icon={(props) => <NoteStack {...props} />}
                            accessibilityLabel={t('title.notes')}
                        />
                    </Tooltip>
                )}

                {recent.length > 0 && (
                    <Tooltip title={t('button.close_all')}>
                        <IconButton
                            mode='contained'
                            onPress={onClearAll}
                            icon={(props) => <Close {...props} />}
                            accessibilityLabel={t('button.close_all')}
                        />
                    </Tooltip>
                )}
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
        paddingTop: 8,
        paddingHorizontal: 16,
        flexDirection: 'row',
        justifyContent: 'space-between'
    }
})
