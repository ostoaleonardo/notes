import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { AnimatedView, Separator, Typography } from '@/components'
import { RepositoryMenu } from './repository-menu'
import { OpenInNew } from '@/icons'
import { useFileStorage, useIconProps, useRepositories } from '@/hooks'
import { getGroupedRadius, getRepositoryPath } from '@/utils'

export function RepositoryItem({
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
    const iconProps = useIconProps(16)

    const [expanded, setExpanded] = useState(false)

    const descendants = getDescendants(repository.id)
    const folderCount = descendants.filter((descendant) => descendant.depth === 0).length

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
                    onPress={() => setExpanded((prev) => !prev)}
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
                        opacity={0.4}
                    >
                        {getRepositoryPath(repository.uri)}
                    </Typography>

                    <Typography
                        variant='caption'
                        opacity={active ? 0.8 : 0.5}
                    >
                        {count}, {t('count.folders', { count: folderCount })}
                    </Typography>
                </Pressable>

                <Tooltip title={t('repositories.open')}>
                    <IconButton
                        onPress={onOpen}
                        icon={() => <OpenInNew {...iconProps} />}
                    />
                </Tooltip>

                <RepositoryMenu
                    onRename={onRename}
                    onForget={onForget}
                    onDelete={onDelete}
                />
            </View>

            {expanded && <Separator />}

            {expanded && (
                <View style={styles.structure}>
                    {descendants.length === 0 ? (
                        <Typography
                            variant='caption'
                            opacity={0.4}
                        >
                            {t('repositories.no_folders')}
                        </Typography>
                    ) : (
                        descendants.map((descendant) => {
                            const descendantFolderCount = getDescendants(descendant.id)
                                .filter((d) => d.depth === 0).length

                            return (
                                <View
                                    key={descendant.id}
                                    style={{ paddingLeft: descendant.depth * 16 }}
                                >
                                    <Typography variant='caption'>
                                        {descendant.alias}
                                    </Typography>
                                    <Typography
                                        variant='caption'
                                        opacity={0.4}
                                    >
                                        {t('count.notes', { count: listMarkdownFiles(descendant.uri).length })}, {t('count.folders', { count: descendantFolderCount })}
                                    </Typography>
                                </View>
                            )
                        })
                    )}
                </View>
            )}
        </AnimatedView>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 16,
        gap: 16
    },
    row: {
        paddingLeft: 20,
        paddingRight: 8,
        alignItems: 'center',
        flexDirection: 'row'
    },
    content: {
        flex: 1,
        gap: 4
    },
    structure: {
        paddingHorizontal: 20,
        gap: 12
    }
})
