import { Menu, useTheme } from 'react-native-paper'

import { TRANSPARENT } from '@/constants/themes'
import { RADIUS } from '@/constants/radius'
import { SPACING } from '@/constants/spacing'

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
        gap: SPACING.xxs,
        padding: SPACING.xs,
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
