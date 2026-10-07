import { Menu, useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS, SPACING, BORDER_WIDTH } from '@/constants/theme'

export function MenuContainer({
    anchor,
    visible,
    onClose,
    position = 'top',
    grouped = false,
    children
}) {
    const { colors } = useTheme()

    const contentStyle = grouped ? {
        gap: SPACING.xxs,
        padding: SPACING.xs,
        backgroundColor: TRANSPARENT.color
    } : {
        borderWidth: BORDER_WIDTH.thin,
        overflow: 'hidden',
        borderRadius: RADIUS.lg,
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
