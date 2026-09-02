import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'
import { IconButton, Tooltip } from 'react-native-paper'
import { useRecentNotes, useRepositories, useNotes, useTemplates, useUtils } from '@/hooks'
import { Close, Plus } from '@/icons'
import { ROUTES, TEMPLATE_TAB_PREFIX } from '@/constants'
import { getEditorPath, getPreviewNote, getRecentIds } from '@/utils'
import { RecentNotesGrid } from './recent-notes-grid'

export function RecentNotes({ onClose }) {
    const { t } = useTranslation()
    const { notes } = useNotes()
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
                    pinned: pinned.has(id)
                }
            }

            const note = notes.find((entry) => entry.id === id)

            return {
                id,
                title: note.title || t('notes.untitled'),
                preview: getPreviewNote(note.note),
                pinned: pinned.has(id)
            }
        })
    }, [pinned, recent, notes, templates])

    const onCreateNote = () => {
        onClose()
        router.push({
            pathname: ROUTES.ADD_NOTE,
            params: { repositoryId: activeRepositoryTree[0]?.id }
        })
    }

    const onOpen = (card) => {
        onClose()
        router.push(getEditorPath(card.id))
    }

    const onRemove = (card) => {
        if (card.pinned) {
            const next = new Set(pinned)
            next.delete(card.id)
            updatePinned(next)
        } else {
            removeRecent(card.id)
        }
    }

    const onClearAll = () => {
        clearRecent()
    }

    return (
        <View style={styles.container}>
            <RecentNotesGrid
                cards={cards}
                onOpen={onOpen}
                onRemove={onRemove}
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
        width: '100%',
        gap: 8
    },
    actions: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
