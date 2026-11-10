import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'

import { Typography } from '@/ui/typography'
import { Touchable } from '@/ui/touchable'
import { useTheme } from '@/ui/hooks/use-theme'
import { DrawerFolderActions } from './drawer-folder-actions'
import { treeRowStyles } from '@/ui/tree-row-styles'

import { useMenuAction } from '@/hooks/use-menu-action'

import { ChevronRight } from '@/ui/icons/chevron-right'

import { OPACITY, RADIUS, ICON_SIZE } from '@/constants/theme'

export const DrawerLevelFolder = memo(({
    repository,
    onEnter,
    onAction
}) => {
    const { colors } = useTheme()
    const menu = useMenuAction()

    const onPress = useCallback(() => onEnter(repository.id), [onEnter, repository.id])

    const handleAction = useCallback((action) => {
        onAction(action, repository.id)
    }, [onAction, repository.id])

    return (
        <View>
            <View style={styles.container}>
                <Touchable
                    accessibilityRole='button'
                    onPress={onPress}
                    onLongPress={menu.onOpen}
                    style={treeRowStyles.touch}
                >
                    <View style={treeRowStyles.content}>
                        <Typography uppercase numberOfLines={1} styleProps={treeRowStyles.label}>
                            {repository.alias}
                        </Typography>
                        <View style={treeRowStyles.slot}>
                            <ChevronRight
                                color={colors.onBackground}
                                opacity={OPACITY.muted}
                                width={ICON_SIZE.lg}
                                height={ICON_SIZE.lg}
                            />
                        </View>
                    </View>
                </Touchable>
            </View>
            <DrawerFolderActions menu={menu} onAction={handleAction} />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl
    }
})
