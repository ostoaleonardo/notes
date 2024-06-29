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
                paddingHorizontal: 24
            }}
            onPress={() => router.push(path)}
            android_ripple={{ color:  COLORS.white5 }}
        >
            <Typography
                uppercase
                color={pathname === path ? COLORS.white : COLORS.white75}
            >
                {label}
            </Typography>
        </Pressable>
    )
}
