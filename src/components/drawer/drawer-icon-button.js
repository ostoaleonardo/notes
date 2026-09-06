import { IconActionButton } from '../button'

export function DrawerIconButton({ icon, ...props }) {
    return (
        <IconActionButton
            {...props}
            icon={icon}
            iconSize={16}
            iconOpacity={0.6}
            size={10}
        />
    )
}
