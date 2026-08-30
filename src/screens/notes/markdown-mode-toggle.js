import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { MenuContainer, MenuItem } from '@/components'
import { useNoteActionsMenu } from './use-note-actions-menu'
import { Book, Code, EditNote, KeyboardArrowDown, KeyboardArrowUp } from '@/icons'
import { FONTS } from '@/constants'

export const MarkdownModeToggle = ({
    mode,
    onSetMode, scope,
    onOpenTags,
    onOpenTemplates,
    onOpenPassword,
    hasPassword
}) => {
    const { t } = useTranslation()
    const { colors } = useTheme()
    const openProgress = useSharedValue(0)

    const [menuVisible, setMenuVisible] = useState(false)
    const closeMenu = () => setMenuVisible(false)
    const read = mode === 'read'

    useEffect(() => {
        openProgress.value = withTiming(menuVisible ? 1 : 0, { duration: 200 })
    }, [menuVisible])

    const secondaryAnimatedStyle = useAnimatedStyle(() => ({
        borderTopLeftRadius: interpolate(openProgress.value, [0, 1], [4, 24]),
        borderBottomLeftRadius: interpolate(openProgress.value, [0, 1], [4, 24]),
        borderTopRightRadius: interpolate(openProgress.value, [0, 1], [22, 24]),
        borderBottomRightRadius: interpolate(openProgress.value, [0, 1], [22, 24]),
        opacity: interpolate(openProgress.value, [0, 1], [1, 0.8])
    }))

    const toggleIconProps = { color: colors.background, width: 20, height: 20 }
    const menuIconProps = { color: colors.background, width: 18, height: 18 }

    const noteActionsMenu = useNoteActionsMenu({
        onClose: closeMenu,
        onSetMode,
        onOpenTags,
        onOpenTemplates,
        onOpenPassword,
        hasPassword
    })

    return (
        <View style={styles.container}>
            <View style={{ ...styles.toggle, backgroundColor: colors.onBackground }}>
                <TouchableRipple
                    onPress={() => onSetMode(read ? 'live' : 'read')}
                    style={styles.touchable}
                >
                    <View style={styles.toggleContent}>
                        {read ? <EditNote {...toggleIconProps} />
                            : <Book {...toggleIconProps} />}
                        <Text style={{ ...styles.label, color: colors.background }}>
                            {t(read ? 'button.edit' : 'button.preview')}
                        </Text>
                    </View>
                </TouchableRipple>
            </View>

            <MenuContainer
                visible={menuVisible}
                onClose={closeMenu}
                position='top'
                anchor={
                    <View style={styles.menu}>
                        <Animated.View
                            style={[
                                StyleSheet.absoluteFill,
                                secondaryAnimatedStyle,
                                { backgroundColor: colors.onBackground }
                            ]}
                        />
                        <TouchableRipple
                            onPress={() => setMenuVisible(true)}
                            style={styles.touchable}
                        >
                            {menuVisible
                                ? <KeyboardArrowUp {...menuIconProps} />
                                : <KeyboardArrowDown {...menuIconProps} />}
                        </TouchableRipple>
                    </View>
                }
            >
                {scope === 'template' ? (
                    <MenuItem
                        title={t('button.code')}
                        leadingIcon={() => <Code color={colors.onBackground} width={20} height={20} />}
                        onPress={() => { closeMenu(); onSetMode('code') }}
                    />
                ) : noteActionsMenu}
            </MenuContainer>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        gap: 2,
        flexDirection: 'row',
        alignItems: 'center'
    },
    touchable: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    toggle: {
        height: 44,
        borderRadius: 4,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
        overflow: 'hidden'
    },
    toggleContent: {
        gap: 8,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16
    },
    label: {
        fontSize: 14,
        fontFamily: FONTS.azeretMedium
    },
    menu: {
        width: 44,
        height: 44,
        overflow: 'hidden'
    }
})
