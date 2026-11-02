import { padding } from '@expo/ui/jetpack-compose/modifiers'

export const paddingAround = padding

export const paddingHorizontal = (value) => padding(value, 0, value, 0)
