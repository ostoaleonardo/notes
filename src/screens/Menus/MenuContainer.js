import { Menu, useTheme } from 'react-native-paper'

export function MenuContainer({ visible, onClose, anchor, children, ...props }) {
    const { colors } = useTheme()

    return (
        <Menu
            elevation={0}
            visible={visible}
            onDismiss={onClose}
            anchor={anchor}
            {...props}
            contentStyle={{
                borderRadius: 24,
                overflow: 'hidden',
                backgroundColor: colors.surface,
                ...props.contentStyle
            }}
        >
            {children}
        </Menu>
    )
}
