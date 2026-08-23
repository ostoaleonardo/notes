import { IconButton } from 'react-native-paper'
import { useIconProps } from '@/hooks'

export function DrawerIconButton({ icon: Icon, ...props }) {
    const iconProps = useIconProps(16, 0.6)

    return (
        <IconButton
            {...props}
            size={10}
            icon={() => <Icon {...iconProps} />}
        />
    )
}
