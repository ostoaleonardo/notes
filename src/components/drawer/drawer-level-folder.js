import { memo, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { useTheme } from 'react-native-paper'

import { Typography } from '@/ui/typography'
import { Touchable } from '@/ui/touchable'
import { DrawerFolderActions } from './drawer-folder-actions'
import { levelRowStyles } from './drawer-level-styles'

import { useMenuAction } from '@/hooks/use-menu-action'

import { ChevronRight } from '@/icons/chevron-right'

import { OPACITY, RADIUS, ICON_SIZE } from '@/constants/theme'

export const DrawerLevelFolder = memo(function DrawerLevelFolder({
    repository,
    onEnter,
    onAction
}) {
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
