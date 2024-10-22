import { Menu, useTheme } from 'react-native-paper'

export function MenuContainer({ anchor, visible, onClose, children, position = 'top' }) {
    const { colors } = useTheme()
    const { background, onBackground } = colors

    return (
        <Menu
            elevation={0}
            anchor={anchor}
            visible={visible}
            onDismiss={onClose}
            anchorPosition={position}
            contentStyle={{
                borderRadius: 24,
                overflow: 'hidden',
                borderWidth: 1,
                backgroundColor: background,
                borderColor: onBackground + '0d'
            }}
        >
            {children}
        </Menu>
    )
}
