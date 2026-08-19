import { Pressable, StyleSheet, View } from 'react-native'
import { IconButton, Tooltip, useTheme } from 'react-native-paper'
import { useTranslation } from 'react-i18next'
import { Typography } from '@/components'
import { Close, Delete, Edit } from '@/icons'
import { useIconProps } from '@/hooks'
import { getGroupedRadius, getRepositoryPath } from '@/utils'

export function RepositoryItem({ repository, count, active, onOpen, onRename, onForget, onDelete, isFirst, isLast }) {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const iconProps = useIconProps(16)

    return (
        <Pressable
            onPress={onOpen}
            style={[
                styles.container,
                {
                    backgroundColor: colors.surface,
                    ...getGroupedRadius(isFirst, isLast)
                }
            ]}
        >
            <View style={styles.content}>
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
                    {count}
                </Typography>
            </View>

            <Tooltip title={t('repositories.rename')}>
                <IconButton
                    onPress={onRename}
                    icon={() => <Edit {...iconProps} />}
                />
            </Tooltip>
            <Tooltip title={t('repositories.forget')}>
                <IconButton
                    onPress={onForget}
                    icon={() => <Close {...iconProps} />}
                />
            </Tooltip>
            <Tooltip title={t('repositories.delete')}>
                <IconButton
                    onPress={onDelete}
                    icon={() => <Delete {...iconProps} color={colors.error} />}
                />
            </Tooltip>
        </Pressable>
    )
}

const styles = StyleSheet.create({
    container: {
        paddingLeft: 20,
        paddingRight: 8,
        paddingVertical: 16,
        alignItems: 'center',
        flexDirection: 'row'
    },
    content: {
        flex: 1,
        gap: 4
    }
})
