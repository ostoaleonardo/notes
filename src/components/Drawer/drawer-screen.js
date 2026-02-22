import { Pressable } from 'react-native'
import { useTheme } from 'react-native-paper'
import { router } from 'expo-router'
import { Typography } from '../typography'
import { ArrowForward } from '@/icons'

export function DrawerScreen({ label, path }) {
    const { colors } = useTheme()
    const { onBackground } = colors

    return (
        <Pressable
            style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}
            onPress={() => router.push(path)}
            android_ripple={{ color: onBackground + '1a' }}
        >
            <Typography
                uppercase
            >
                {label}
            </Typography>
            <ArrowForward fill={onBackground} />
        </Pressable>
    )
}
