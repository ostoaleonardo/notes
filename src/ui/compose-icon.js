import { Icon } from '@expo/ui/jetpack-compose'

export const ComposeIcon = ({
    icon,
    color,
    size,
    modifiers,
    contentDescription
}) => {
    if (__DEV__ && !icon.source) throw new Error('ComposeIcon needs an icon with a source')

    return (
        <Icon
            size={size}
            tint={color}
            source={icon.source}
            modifiers={modifiers}
            contentDescription={contentDescription}
        />
    )
}
