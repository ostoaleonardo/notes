import { memo, useCallback, useMemo, useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { Typography } from '../typography'
import { DrawerList } from './drawer-list'
import { DrawerNoteItem } from './drawer-note-item'
import { openEditor } from './drawer-open-editor'

import { useCurrentNote } from '@/hooks/use-current-note'
import { useNotes } from '@/hooks/use-notes'
import { useTags } from '@/hooks/use-tags'
import { buildDrawerTagRows } from '@/utils/drawer-tags'


import { SPACING } from '@/constants/spacing'

const TagRow = memo(function TagRow({ name, count, expanded, onToggle }) {
    return (
        <Pressable
            onPress={() => onToggle(name)}
            accessibilityState={{ expanded }}
            style={styles.tag}
        >
            <Typography
                bold={expanded}
                numberOfLines={1}
                styleProps={styles.tagName}
            >
                {name}
            </Typography>
            <Typography
                opacity={0.5}
                variant='caption'
            >
                {count}
            </Typography>
        </Pressable>
    )
})

export function DrawerTagsView({ closeDrawer }) {
    const { t } = useTranslation()
    const { tags } = useTags()
    const { notes } = useNotes()
    const { currentId } = useCurrentNote()
    const [expandedTag, setExpandedTag] = useState('')

    const rows = useMemo(
        () => buildDrawerTagRows(tags || [], notes, expandedTag),
        [tags, notes, expandedTag]
    )

    const onToggleTag = useCallback((name) => {
        setExpandedTag((current) => (current === name ? '' : name))
    }, [])

    const onOpenNote = useCallback((id) => {
        closeDrawer()
        if (id === currentId) return

        openEditor(id, currentId)
    }, [closeDrawer, currentId])

    const renderItem = useCallback(({ item }) => {
        if (item.type === 'note') {
            return (
                <DrawerNoteItem
                    note={item.note}
                    depth={item.depth}
                    active={item.note.path === currentId}
                    onOpenNote={onOpenNote}
                />
            )
        }

        return (
            <TagRow
                name={item.name}
                count={item.count}
                expanded={item.expanded}
                onToggle={onToggleTag}
            />
        )
    }, [currentId, onOpenNote, onToggleTag])

    return (
        <>
            <DrawerList
                data={rows}
                keyExtractor={(row) => row.id}
                renderItem={renderItem}
                ListEmptyComponent={(
                    <View style={styles.empty}>
                        <Typography opacity={0.5}>
                            {t('message.tags.empty')}
                        </Typography>
                    </View>
                )}
            />
        </>
    )
}

const styles = StyleSheet.create({
    tag: {
        gap: SPACING.sm,
        paddingVertical: SPACING.xs,
        paddingStart: SPACING.sm,
        paddingEnd: SPACING.lg,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between'
    },
    tagName: {
        flex: 1
    },
    empty: {
        paddingVertical: SPACING.lg,
        paddingStart: SPACING.sm
    }
})
