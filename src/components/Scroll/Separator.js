import { View } from 'react-native'
import { COLORS } from '@/constants'

export function Separator({ style }) {
    return (
        <View
            style={{
                height: 1,
                backgroundColor: COLORS.white10,
                ...style
            }}
        />
    )
}
