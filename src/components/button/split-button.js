import { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { TouchableRipple, useTheme } from 'react-native-paper'
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { MenuContainer } from '../menu/menu-container'
import { KeyboardArrowDown, KeyboardArrowUp } from '@/icons'
import { FONTS } from '@/constants'

export const SplitButton = ({
    icon: Icon,
    label,
    onPress,
    children,
    visible: controlledVisible,
    onOpen: controlledOnOpen,
    onClose: controlledOnClose
}) => {
    const { colors } = useTheme()
    const openProgress = useSharedValue(0)

    const [uncontrolledVisible, setUncontrolledVisible] = useState(false)
    const menuVisible = controlledVisible ?? uncontrolledVisible
    const openMenu = controlledOnOpen ?? (() => setUncontrolledVisible(true))
    const closeMenu = controlledOnClose ?? (() => setUncontrolledVisible(false))

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

    const primaryIconProps = { color: colors.background, width: 20, height: 20 }
    const menuIconProps = { color: colors.background, width: 18, height: 18 }

    return (
        <View style={styles.container}>
            <View style={{ ...styles.primary, backgroundColor: colors.onBackground }}>
                <TouchableRipple
                    onPress={onPress}
                    style={styles.touchable}
                >
                    <View style={styles.primaryContent}>
                        <Icon {...primaryIconProps} />
                        {label && (
                            <Text style={{ ...styles.label, color: colors.background }}>
                                {label}
                            </Text>
                        )}
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
                            onPress={openMenu}
                            style={styles.touchable}
                        >
                            {menuVisible
                                ? <KeyboardArrowUp {...menuIconProps} />
                                : <KeyboardArrowDown {...menuIconProps} />}
                        </TouchableRipple>
                    </View>
                }
            >
                {children}
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
    primary: {
        height: 44,
        borderRadius: 4,
        borderTopLeftRadius: 22,
        borderBottomLeftRadius: 22,
        overflow: 'hidden'
    },
    primaryContent: {
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
