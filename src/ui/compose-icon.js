import { Icon } from '@expo/ui/jetpack-compose'

export function ComposeIcon({ icon, color, size, modifiers }) {
    if (__DEV__ && !icon.source) throw new Error('ComposeIcon needs an icon with a source')

    return <Icon source={icon.source} tint={color} size={size} modifiers={modifiers} />
}
