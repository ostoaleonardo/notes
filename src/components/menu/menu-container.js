import { Menu, useTheme } from 'react-native-paper'

import { RADIUS, TRANSPARENT } from '@/constants/themes'

export function MenuContainer({
    anchor,
    visible,
    onClose,
    position = 'top',
    grouped = false,
    children,
}) {
    const { colors } = useTheme()

    const contentStyle = grouped ? {
        gap: 4,
        padding: 6,
        backgroundColor: TRANSPARENT.color
    } : {
        borderWidth: 1,
        overflow: 'hidden',
        borderRadius: RADIUS.outer,
        backgroundColor: colors.surface,
        borderColor: colors.onBackground + TRANSPARENT[5]
    }

    return (
        <Menu
            elevation={0}
            anchor={anchor}
            visible={visible}
            onDismiss={onClose}
            anchorPosition={position}
            contentStyle={contentStyle}
        >
            {children}
        </Menu>
    )
}
