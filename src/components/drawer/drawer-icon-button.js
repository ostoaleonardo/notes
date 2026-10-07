import { IconButton } from 'react-native-paper'
import { ICON_SIZE } from '@/constants/theme'

export function DrawerIconButton({ icon: Icon, size = ICON_SIZE.md, ...props }) {
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
