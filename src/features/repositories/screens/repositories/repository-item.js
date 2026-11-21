import { memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'

import { RepositoryMenu } from './repository-menu'
import { AnimatedView } from '@/ui/animated/animated-view'
import { Divider } from '@/ui/divider/divider'
import { Typography } from '@/ui/typography'
import { useTheme } from '@/ui/hooks/use-theme'

import { useDescendantNoteCounts } from '@/features/repositories/hooks/use-descendant-note-counts'
import { useFileStorage } from '@/shared/hooks/use-file-storage'
import { useGroupPosition } from '@/ui/hooks/use-group-position'
import { useFolders } from '@/shared/hooks/use-folders'
import { getStackedRadiusStyle } from '@/ui/utils/group-position'
import { IconButton } from '@/ui/button/icon-button'
import { Progress } from '@/ui/progress'
import { getChildFolderCounts } from '@/shared/utils/folder-note-counts'
import { getFolderPath } from '@/features/repositories/utils/repository-path'

import { OpenInNew } from '@/icons/open-in-new'
import { SPACING, OPACITY } from '@/shared/constants/theme'
import { PENDING_COUNT } from '@/features/repositories/constants/repository-counts'

export const RepositoryItem = memo(({
    folder,
    count,
    active,
    onOpen,
    onRename,
    onForget,
    onDelete
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const { getDescendants } = useFolders()
    const { scanMarkdownFiles } = useFileStorage()
    const position = useGroupPosition()

    const [expanded, setExpanded] = useState(false)
    const onToggleExpanded = useCallback(() => setExpanded((prev) => !prev), [])
    const folderId = folder.id
    const onPressOpen = useCallback(() => onOpen(folderId), [onOpen, folderId])
    const onPressRename = useCallback(() => onRename(folderId), [onRename, folderId])
    const onPressForget = useCallback(() => onForget(folderId), [onForget, folderId])
    const onPressDelete = useCallback(() => onDelete(folderId), [onDelete, folderId])
    const descendants = useMemo(
        () => getDescendants(folder.id),
        [getDescendants, folder.id]
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
        scanMarkdownFiles,
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
                        {folder.alias}
                    </Typography>
                    <Typography
                        variant='bodySmall'
                        opacity={OPACITY.disabled}
                    >
                        {getFolderPath(folder.uri)}
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
