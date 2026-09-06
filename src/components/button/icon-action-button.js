import { IconButton } from 'react-native-paper'
import { useIconProps } from '@/hooks'

export function IconActionButton({ icon: Icon, iconSize, iconOpacity, ...props }) {
    const iconProps = useIconProps(iconSize, iconOpacity)

    return (
        <IconButton
            {...props}
            icon={() => <Icon {...iconProps} />}
        />
    )
}
