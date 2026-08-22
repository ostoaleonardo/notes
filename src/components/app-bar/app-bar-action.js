import { Appbar, Tooltip } from 'react-native-paper'
import { useIconProps } from '@/hooks'

export function AppBarAction({ tooltip, onPress, icon: Icon }) {
    const iconProps = useIconProps()

    return (
        <Tooltip title={tooltip}>
            <Appbar.Action
                animated={false}
                onPress={onPress}
                icon={() => <Icon {...iconProps} />}
            />
        </Tooltip>
    )
}
