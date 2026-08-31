import { useEffect, useMemo, useState } from 'react'
import { router } from 'expo-router'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { Scroll, Typography } from '@/components'
import { useIconProps, useRecentNotes, useRepositories, useNotes, useTemplates, useUtils } from '@/hooks'
import { Close, Plus } from '@/icons'
import { COMMONS, ROUTES, TEMPLATE_TAB_PREFIX, TRANSPARENT } from '@/constants'
import { getEditorPath, getPreviewNote, getRecentIds } from '@/utils'

const CARDS_HEIGHT = 220

export function RecentNotes({ onClose }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { notes } = useNotes()
    const { pinned, updatePinned } = useUtils()
    const { activeRepositoryTree } = useRepositories()
    const { listTemplates } = useTemplates()
    const { recent, removeRecent, clearRecent } = useRecentNotes()
    const [templates, setTemplates] = useState([])
    const iconProps = useIconProps(14, 0.6)

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
        updatePinned(new Set())
    }

    return (
        <View style={styles.container}>
            <View style={styles.cards}>
                {cards.length === 0 ? (
                    <Typography opacity={0.5}>
                        {t('message.notes.no_recent')}
                    </Typography>
                ) : (
                    <Scroll
                        horizontal
                        overScrollMode='never'
                        contentContainerStyle={styles.content}
                    >
                        {cards.map((card) => (
                            <Pressable
                                key={card.id}
                                onPress={() => {
                                    onClose()
                                    router.push(getEditorPath(card.id))
                                }}
                                style={{
                                    ...styles.card,
                                    backgroundColor: colors.surface,
                                    borderColor: colors.onSurface + TRANSPARENT[10]
                                }}
                            >
                                <Pressable
                                    onPress={() => onRemove(card)}
                                    hitSlop={8}
                                    accessibilityLabel={t('button.close')}
                                    style={{
                                        ...styles.close,
                                        backgroundColor: colors.background + TRANSPARENT[70]
                                    }}
                                >
                                    <Close {...iconProps} />
                                </Pressable>

                                <Typography
                                    bold
                                    numberOfLines={1}
                                    fontSize={13}
                                    styleProps={styles.title}
                                >
                                    {card.title}
                                </Typography>

                                <Typography
                                    opacity={0.6}
                                    fontSize={11}
                                    numberOfLines={6}
                                >
                                    {card.preview}
                                </Typography>
                            </Pressable>
                        ))}
                    </Scroll>
                )}
            </View>

            <View style={styles.actions}>
                <Tooltip title={t('notes.create')}>
                    <IconButton
                        mode='contained'
                        onPress={onCreateNote}
                        icon={(props) => <Plus {...props} />}
                        accessibilityLabel={t('notes.create')}
                    />
                </Tooltip>

                {cards.length > 0 && (
                    <Tooltip title={t('button.clear_all')}>
                        <IconButton
                            mode='contained'
                            onPress={onClearAll}
                            icon={(props) => <Close {...props} />}
                            accessibilityLabel={t('button.clear_all')}
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
    cards: {
        minHeight: CARDS_HEIGHT,
        justifyContent: 'center',
        alignItems: 'center'
    },
    content: {
        gap: 8,
        paddingHorizontal: 16,
        alignItems: 'flex-start'
    },
    card: {
        width: 180,
        height: CARDS_HEIGHT,
        gap: 6,
        padding: 12,
        borderWidth: 1,
        borderRadius: COMMONS.radius
    },
    close: {
        position: 'absolute',
        top: 8,
        right: 8,
        zIndex: 1,
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center'
    },
    title: {
        paddingRight: 24
    },
    actions: {
        paddingHorizontal: 16,
        paddingTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    }
})
