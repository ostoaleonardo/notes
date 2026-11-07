import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { RepositoryMenu } from './repository-menu'
import { AnimatedView } from '@/ui/animated/animated-view'
import { Divider } from '@/ui/divider/divider'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useDescendantNoteCounts } from '@/hooks/use-descendant-note-counts'
import { useFileStorage } from '@/hooks/use-file-storage'
import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { useRepositories } from '@/hooks/use-repositories'
import { getStackedRadiusStyle } from '@/ui/utils/group-position'
import { IconButton } from '@/ui/button/icon-button'
import { Progress } from '@/ui/progress'
import { getChildFolderCounts } from '@/utils/repository-note-counts'
import { getRepositoryPath } from '@/utils/repository-path'

import { OpenInNew } from '@/icons/open-in-new'
import { SPACING, OPACITY } from '@/constants/theme'
import { PENDING_COUNT } from '@/constants/repository-counts'

export const RepositoryItem = memo(({
    repository,
    count,
    active,
    onOpen,
    onRename,
    onForget,
    onDelete
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getDescendants } = useRepositories()
    const { listMarkdownFiles } = useFileStorage()
    const position = useGroupPosition()

    const [expanded, setExpanded] = useState(false)
    const onToggleExpanded = useCallback(() => setExpanded((prev) => !prev), [])
    const repositoryId = repository.id
    const onPressOpen = useCallback(() => onOpen(repositoryId), [onOpen, repositoryId])
    const onPressRename = useCallback(() => onRename(repositoryId), [onRename, repositoryId])
    const onPressForget = useCallback(() => onForget(repositoryId), [onForget, repositoryId])
    const onPressDelete = useCallback(() => onDelete(repositoryId), [onDelete, repositoryId])
    const descendants = useMemo(
        () => getDescendants(repository.id),
        [getDescendants, repository.id]
    )
    const folderCount = useMemo(
        () => descendants.filter((descendant) => descendant.depth === 0).length,
        [descendants]
    )
    const childFolderCounts = useMemo(
        () => getChildFolderCounts(descendants),
        [descendants]
    )

    const { counts: noteCounts, loading: loadingCounts } = useDescendantNoteCounts(
        descendants,
        listMarkdownFiles,
        expanded
    )

    return (
        <AnimatedView
            style={{
                ...styles.container,
                backgroundColor: colors.surface,
                ...getStackedRadiusStyle(position)
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
                        variant='bodySmall'
                        opacity={OPACITY.disabled}
                    >
                        {getRepositoryPath(repository.uri)}
                    </Typography>

                    <Typography
                        variant='bodySmall'
                        opacity={active ? OPACITY.emphasized : OPACITY.muted}
                    >
                        {count}, {t('count.folders', { count: folderCount })}
                    </Typography>
                </Pressable>

                <IconButton
                    icon={OpenInNew}
                    label={t('repositories.open')}
                    onPress={onPressOpen}
                />

                <RepositoryMenu
                    onRename={onPressRename}
                    onForget={onPressForget}
                    onDelete={onPressDelete}
                />
            </View>

            {expanded && <Divider />}

            {expanded && (
                <View style={styles.structure}>
                    {descendants.length === 0 ? (
                        <Typography
                            variant='bodySmall'
                            opacity={OPACITY.disabled}
                        >
                            {t('repositories.no_folders')}
                        </Typography>
                    ) : (
                        descendants.map((descendant) => (
                            <View
                                key={descendant.id}
                                style={{ paddingLeft: descendant.depth * SPACING.lg }}
                            >
                                <Typography variant='bodySmall'>
                                    {descendant.alias}
                                </Typography>
                                <Typography
                                    variant='bodySmall'
                                    opacity={OPACITY.disabled}
                                >
                                    {noteCounts[descendant.id] === undefined
                                        ? PENDING_COUNT
                                        : t('count.notes', { count: noteCounts[descendant.id] })}
                                    {', '}
                                    {t('count.folders', { count: childFolderCounts[descendant.id] || 0 })}
                                </Typography>
                            </View>
                        ))
                    )}

                    {loadingCounts && (
                        <View style={styles.loader}>
                            <Progress />
                        </View>
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
    },
    loader: {
        alignItems: 'center'
    }
})
