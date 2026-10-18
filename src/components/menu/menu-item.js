import { createElement, useCallback } from 'react'
import { StyleSheet, View } from 'react-native'
import { Menu, useTheme } from 'react-native-paper'

import { MENU } from '@/constants/components'
import { TRANSPARENT } from '@/constants/themes'
import { FONTS, RADIUS, TYPOGRAPHY_SIZE_VARIANTS } from '@/constants/theme'

const useSizedIcon = (icon, style) => useCallback(
    (props) => createElement(
        View,
        { style: [styles.icon, style] },
        icon({ ...props, width: MENU.iconSize, height: MENU.iconSize })
    ),
    [icon, style]
)

export function MenuItem({ leadingIcon, trailingIcon, contentStyle, ...props }) {
    const { colors } = useTheme()
    const sizedLeading = useSizedIcon(leadingIcon)
    const sizedTrailing = useSizedIcon(trailingIcon, styles.trailing)

    return (
        <View style={styles.item}>
            <Menu.Item
                titleStyle={styles.title}
                rippleColor={colors.onBackground + TRANSPARENT[10]}
                leadingIcon={leadingIcon ? sizedLeading : undefined}
                trailingIcon={trailingIcon ? sizedTrailing : undefined}
                contentStyle={[leadingIcon ? styles.withIcon : styles.withoutIcon, contentStyle]}
                {...props}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    item: {
        overflow: 'hidden',
        borderRadius: RADIUS.lg,
        marginVertical: MENU.itemGap
    },
    icon: {
        flex: 1,
        justifyContent: 'center'
    },
    trailing: {
        alignItems: 'flex-end'
    },
    withIcon: {
        marginLeft: MENU.iconToTitle
    },
    withoutIcon: {
        marginLeft: 0
    },
    title: {
        fontSize: TYPOGRAPHY_SIZE_VARIANTS.bodySmall,
        textTransform: 'uppercase',
        fontFamily: FONTS.azeretLight
    }
})
