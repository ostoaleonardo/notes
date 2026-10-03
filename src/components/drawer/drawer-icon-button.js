import { IconButton } from 'react-native-paper'
import { ICON_SIZE } from '@/constants/icon-size'

export function DrawerIconButton({ icon: Icon, size = ICON_SIZE.sm, ...props }) {
    return (
        <IconButton
            {...props}
            size={size}
            icon={(props) => (
                <Icon
                    width={size}
                    height={size}
                    {...props}
                />
            )}
        />
    )
}
