import { IconButton } from 'react-native-paper'

export function DrawerIconButton({ icon: Icon, ...props }) {
    return (
        <IconButton
            {...props}
            size={16}
            icon={(props) => (
                <Icon
                    width={16}
                    height={16}
                    {...props}
                />
            )}
        />
    )
}
