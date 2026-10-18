import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'

import { Typography } from '@/components/typography'
import { DrawerFolderActions } from './drawer-folder-actions'
import { levelRowStyles } from './drawer-level-styles'

import { useMenuAnchor } from '@/hooks/use-menu-anchor'

import { ChevronRight } from '@/icons/chevron-right'

import { DRAWER_ITEM } from '@/constants/components'
import { OPACITY, RADIUS } from '@/constants/theme'

export const DrawerLevelFolder = memo(function DrawerLevelFolder({
    repository,
    onEnter,
    onAction
}) {
    const { colors } = useTheme()
    const menu = useMenuAnchor()

    const onPress = useCallback(() => onEnter(repository.id), [onEnter, repository.id])

    const handleAction = useCallback((action) => {
        onAction(action, repository.id)
    }, [onAction, repository.id])

    return (
        <View>
            <View ref={menu.rowRef} collapsable={false} style={styles.container}>
                <TouchableRipple
                    accessibilityRole='button'
                    onPress={onPress}
                    onLongPress={menu.onPressRow}
                    style={levelRowStyles.touch}
                >
                    <View style={levelRowStyles.content}>
                        <Typography uppercase numberOfLines={1} styleProps={levelRowStyles.label}>
                            {repository.alias}
                        </Typography>
                        <View style={levelRowStyles.slot}>
                            <ChevronRight
                                color={colors.onBackground}
                                opacity={OPACITY.muted}
                                width={DRAWER_ITEM.iconSize}
                                height={DRAWER_ITEM.iconSize}
                            />
                        </View>
                    </View>
                </TouchableRipple>
            </View>
            <DrawerFolderActions menu={menu} onAction={handleAction} />
        </View>
    )
})

const styles = StyleSheet.create({
    container: {
        overflow: 'hidden',
        borderRadius: RADIUS.xl,
        marginBottom: DRAWER_ITEM.rowGap
    }
})
