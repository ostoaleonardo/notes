import { Pressable } from 'react-native'
import { router, usePathname } from 'expo-router'
import { Typography } from '../Text'
import { COLORS } from '@/constants'

export function DrawerScreen({ label, path }) {
    const pathname = usePathname()

    return (
        <Pressable
            style={{
                paddingVertical: 16,
                paddingHorizontal: 24,
            }}
            onPress={() => router.push(path)}
            android_ripple={{ color: 'rgba(0, 0, 0, 0.1)' }}
        >
            <Typography
                uppercase
                color={pathname === path ? COLORS.text : COLORS.text50}
            >
                {label}
            </Typography>
        </Pressable>
    )
}
