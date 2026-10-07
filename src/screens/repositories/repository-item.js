import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'

import { RepositoryMenu } from './repository-menu'
import { AnimatedView } from '@/components/animated/animated-view'
import { Separator } from '@/components/separator/separator'
import { Typography } from '@/components/typography'

import { useFileStorage } from '@/hooks/use-file-storage'
import { useRepositories } from '@/hooks/use-repositories'
import { getGroupedRadius } from '@/utils/grouped-card-style'
import { getRepositoryNoteCount } from '@/utils/repository-note-counts'
import { getRepositoryPath } from '@/utils/repository-path'

import { OpenInNew } from '@/icons/open-in-new'
import { SPACING, OPACITY } from '@/constants/theme'

export const RepositoryItem = memo(function RepositoryItem({
    repository,
    count,
    active,
    onOpen,
    onRename,
    onForget,
    onDelete,
    isFirst,
    isLast
}) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getDescendants } = useRepositories()
    const { listMarkdownFiles } = useFileStorage()

    const [expanded, setExpanded] = useState(false)
    const onToggleExpanded = useCallback(() => setExpanded((prev) => !prev), [])
    const openIcon = useCallback((props) => <OpenInNew {...props} />, [])
    const repositoryId = repository.id
    const onPressOpen = useCallback(() => onOpen(repositoryId), [onOpen, repositoryId])
    const onPressRename = useCallback(() => onRename(repositoryId), [onRename, repositoryId])
    const onPressForget = useCallback(() => onForget(repositoryId), [onForget, repositoryId])
    const onPressDelete = useCallback(() => onDelete(repositoryId), [onDelete, repositoryId])
    const noteCountCache = useRef(new Map())

    useEffect(() => {
        if (!expanded) noteCountCache.current.clear()
    }, [expanded])

    const descendants = useMemo(
        () => getDescendants(repository.id),
        [getDescendants, repository.id]
    )
    const folderCount = descendants.filter((descendant) => descendant.depth === 0).length

    const descendantsWithCounts = useMemo(
        () => (
            expanded
                ? descendants.map((descendant) => {
                    const cache = noteCountCache.current
                    if (!cache.has(descendant.id)) {
                        cache.set(descendant.id, getRepositoryNoteCount(descendant.uri, listMarkdownFiles))
                    }

                    return {
                        ...descendant,
                        noteCount: cache.get(descendant.id),
                        folderCount: descendants.filter((d) => d.parentId === descendant.id).length
                    }
                })
                : []
        ),
        [expanded, descendants, listMarkdownFiles]
    )

    return (
        <AnimatedView
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                ...getGroupedRadius(isFirst, isLast)
            }}
        >
            <View style={styles.row}>
                <Pressable
                    accessibilityRole='button'
                    accessibilityState={{ expanded }}
                    onPress={onToggleExpanded}
                    style={styles.content}
                >
                    <Typography
                        bold={active}
                        uppercase
                    >
                        {repository.alias}
                    </Typography>
                    <Typography
                        variant='caption'
                        opacity={OPACITY.disabled}
                    >
                        {getRepositoryPath(repository.uri)}
                    </Typography>

                    <Typography
                        variant='caption'
                        opacity={active ? OPACITY.emphasized : OPACITY.muted}
                    >
                        {count}, {t('count.folders', { count: folderCount })}
                    </Typography>
                </Pressable>

                <Tooltip title={t('repositories.open')}>
                    <IconButton
                        onPress={onPressOpen}
                        icon={openIcon}
                        accessibilityLabel={t('repositories.open')}
                    />
                </Tooltip>

                <RepositoryMenu
                    onRename={onPressRename}
                    onForget={onPressForget}
                    onDelete={onPressDelete}
                />
            </View>

            {expanded && <Separator />}

            {expanded && (
                <View style={styles.structure}>
                    {descendantsWithCounts.length === 0 ? (
                        <Typography
                            variant='caption'
                            opacity={OPACITY.disabled}
                        >
                            {t('repositories.no_folders')}
                        </Typography>
                    ) : (
                        descendantsWithCounts.map((descendant) => (
                            <View
                                key={descendant.id}
                                style={{ paddingLeft: descendant.depth * SPACING.lg }}
                            >
                                <Typography variant='caption'>
                                    {descendant.alias}
                                </Typography>
                                <Typography
                                    variant='caption'
                                    opacity={OPACITY.disabled}
                                >
                                    {t('count.notes', { count: descendant.noteCount })}, {t('count.folders', { count: descendant.folderCount })}
                                </Typography>
                            </View>
                        ))
                    )}
                </View>
            )}
        </AnimatedView>
    )
})

const styles = StyleSheet.create({
    container: {
        paddingVertical: SPACING.lg,
        gap: SPACING.lg
    },
    row: {
        paddingLeft: SPACING.xl,
        paddingRight: SPACING.sm,
        alignItems: 'center',
        flexDirection: 'row'
    },
    content: {
        flex: 1,
        gap: SPACING.xxs
    },
    structure: {
        paddingHorizontal: SPACING.xl,
        gap: SPACING.md
    }
})
